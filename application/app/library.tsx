import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  Pressable, Platform, Modal, TextInput, ActivityIndicator, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { fetchDataFromApi, postData } from '@/utils/api';
import { SearchInput } from '@/components/SearchInput';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingView } from '@/components/LoadingView';
import { EmptyView } from '@/components/EmptyView';
import Breadcrumb from '@/components/Breadcrumb';

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  publisher?: string;
  edition?: string;
  totalCopies: number;
  availableCopies: number;
  coverImage?: string;
  description?: string;
  status: 'AVAILABLE' | 'ISSUED' | 'OUT_OF_STOCK';
}

interface IssuedBook {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  studentName?: string;
  studentId?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
  fine?: number;
}

const CATEGORIES = ['All', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Mathematics', 'Biography', 'Reference'];

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const toast = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'browse' | 'issued'>('browse');
  const [issueModal, setIssueModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [studentId, setStudentId] = useState('');
  const [processing, setProcessing] = useState(false);

  const s = styles(colors);
  const topPad = (Platform.OS === 'web' ? 12 : insets.top) + 8;

  const userRole = userData?.role ?? '';
  const isStudent = userRole === 'STUDENT';
  const isLibrarian = userRole === 'LIBRARIAN';

  // Fetch books
  const { data: booksData, refetch: refetchBooks, isLoading: booksLoading } = useQuery({
    queryKey: ['library-books', category],
    queryFn: () => {
      const endpoint = category === 'All'
        ? '/api/library/books'
        : `/api/library/books?category=${category}`;
      return fetchDataFromApi(endpoint);
    },
  });

  // Fetch issued books
  const { data: issuedData, refetch: refetchIssued, isLoading: issuedLoading } = useQuery({
    queryKey: ['library-issued', userRole],
    queryFn: () => {
      const endpoint = isStudent
        ? '/api/student/library/issued'
        : '/api/library/issued';
      return fetchDataFromApi(endpoint);
    },
  });

  const books: Book[] = booksData?.books ?? booksData?.data ?? [];
  const issuedBooks: IssuedBook[] = issuedData?.issued ?? issuedData?.data ?? [];

  const filteredBooks = books.filter((book) => {
    const q = search.toLowerCase();
    return (
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.isbn?.toLowerCase().includes(q)
    );
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchBooks(), refetchIssued()]);
    setRefreshing(false);
  }, [refetchBooks, refetchIssued]);

  const openIssueModal = (book: Book) => {
    if (book.availableCopies === 0) {
      toast.show('This book is currently out of stock', 'error');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBook(book);
    setStudentId('');
    setIssueModal(true);
  };

  const issueBook = async () => {
    if (!selectedBook) return;

    if (isLibrarian && !studentId.trim()) {
      toast.show('Please enter student ID', 'error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProcessing(true);

    const res = await postData('/api/library/issue', {
      bookId: selectedBook._id,
      studentId: isLibrarian ? studentId : userData?._id,
      issueDate: new Date().toISOString(),
    });

    setProcessing(false);

    if (res?.success || res?.data?.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show('Book issued successfully!', 'success');
      setIssueModal(false);
      setSelectedBook(null);
      setStudentId('');
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['library-issued'] });
    } else {
      toast.show(res?.message || 'Failed to issue book', 'error');
    }
  };

  const returnBook = async (issuedBookId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const res = await postData(`/api/library/return/${issuedBookId}`, {
      returnDate: new Date().toISOString(),
    });

    if (res?.success || res?.data?.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show('Book returned successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['library-issued'] });
    } else {
      toast.show(res?.message || 'Failed to return book', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: '#ef4444' };
    if (days === 0) return { text: 'Due today', color: '#f59e0b' };
    if (days <= 3) return { text: `${days} days left`, color: '#f59e0b' };
    return { text: `${days} days left`, color: colors.mutedForeground };
  };

  const renderBookCard = ({ item }: { item: Book }) => {
    const isAvailable = item.availableCopies > 0;

    return (
      <Pressable style={s.bookCard} onPress={() => isLibrarian && openIssueModal(item)}>
        <View style={s.bookImageContainer}>
          {item.coverImage ? (
            <Image source={{ uri: item.coverImage }} style={s.bookImage} />
          ) : (
            <View style={[s.bookImagePlaceholder, { backgroundColor: colors.muted }]}>
              <Feather name="book" size={32} color={colors.mutedForeground} />
            </View>
          )}
        </View>

        <View style={s.bookInfo}>
          <Text style={s.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={s.bookAuthor} numberOfLines={1}>
            by {item.author}
          </Text>

          {item.isbn && (
            <Text style={s.bookIsbn}>ISBN: {item.isbn}</Text>
          )}

          <View style={s.bookMeta}>
            <View style={s.categoryBadge}>
              <Text style={s.categoryText}>{item.category}</Text>
            </View>

            <View style={s.copiesRow}>
              <Feather
                name="book-open"
                size={12}
                color={isAvailable ? '#10b981' : '#ef4444'}
              />
              <Text style={[s.copiesText, { color: isAvailable ? '#10b981' : '#ef4444' }]}>
                {item.availableCopies}/{item.totalCopies} available
              </Text>
            </View>
          </View>

          {isLibrarian && (
            <Pressable
              style={[
                s.issueButton,
                { backgroundColor: isAvailable ? colors.primary : colors.muted },
              ]}
              onPress={() => openIssueModal(item)}
              disabled={!isAvailable}
            >
              <Feather name="plus" size={14} color={isAvailable ? '#fff' : colors.mutedForeground} />
              <Text style={[s.issueButtonText, { color: isAvailable ? '#fff' : colors.mutedForeground }]}>
                {isAvailable ? 'Issue Book' : 'Out of Stock'}
              </Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  const renderIssuedCard = ({ item }: { item: IssuedBook }) => {
    const daysInfo = getDaysRemaining(item.dueDate);
    const isOverdue = item.status === 'OVERDUE';
    const isReturned = item.status === 'RETURNED';

    return (
      <View style={[s.issuedCard, isOverdue && s.overdueCard]}>
        <View style={s.issuedHeader}>
          <View style={s.issuedInfo}>
            <Text style={s.issuedTitle} numberOfLines={1}>
              {item.bookTitle}
            </Text>
            <Text style={s.issuedAuthor}>{item.bookAuthor}</Text>
            {item.studentName && (
              <Text style={s.studentName}>Student: {item.studentName}</Text>
            )}
          </View>
          <StatusBadge status={item.status} small />
        </View>

        <View style={s.issuedDetails}>
          <View style={s.detailRow}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={s.detailText}>Issued: {formatDate(item.issueDate)}</Text>
          </View>
          <View style={s.detailRow}>
            <Feather name="clock" size={12} color={daysInfo.color} />
            <Text style={[s.detailText, { color: daysInfo.color }]}>
              Due: {formatDate(item.dueDate)}
            </Text>
          </View>
          {item.returnDate && (
            <View style={s.detailRow}>
              <Feather name="check" size={12} color="#10b981" />
              <Text style={s.detailText}>Returned: {formatDate(item.returnDate)}</Text>
            </View>
          )}
        </View>

        {!isReturned && (
          <View style={[s.dueBadge, { backgroundColor: daysInfo.color + '15' }]}>
            <Feather name="alert-circle" size={12} color={daysInfo.color} />
            <Text style={[s.dueText, { color: daysInfo.color }]}>{daysInfo.text}</Text>
          </View>
        )}

        {item.fine && item.fine > 0 && (
          <View style={s.fineRow}>
            <Feather name="alert-triangle" size={14} color="#ef4444" />
            <Text style={s.fineText}>Fine: ₹{item.fine}</Text>
          </View>
        )}

        {!isReturned && (isStudent || isLibrarian) && (
          <Pressable
            style={[s.returnButton, { backgroundColor: '#10b981' }]}
            onPress={() => returnBook(item._id)}
          >
            <Feather name="check-circle" size={14} color="#fff" />
            <Text style={s.returnButtonText}>Return Book</Text>
          </Pressable>
        )}
      </View>
    );
  };

  const isLoading = (activeTab === 'browse' ? booksLoading : issuedLoading) && 
    (activeTab === 'browse' ? books : issuedBooks).length === 0;

  if (isLoading) {
    return <LoadingView message="Loading library..." />;
  }

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backButton}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>Library</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Tab Selector */}
      <View style={s.tabSelector}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab('browse');
          }}
          style={[s.tab, activeTab === 'browse' && s.activeTab]}
        >
          <Feather
            name="book"
            size={16}
            color={activeTab === 'browse' ? '#fff' : colors.mutedForeground}
          />
          <Text style={[s.tabText, activeTab === 'browse' && s.activeTabText]}>
            Browse Books
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab('issued');
          }}
          style={[s.tab, activeTab === 'issued' && s.activeTab]}
        >
          <Feather
            name="book-open"
            size={16}
            color={activeTab === 'issued' ? '#fff' : colors.mutedForeground}
          />
          <Text style={[s.tabText, activeTab === 'issued' && s.activeTabText]}>
            Issued Books
          </Text>
        </Pressable>
      </View>

      <View style={s.tabContent}>
        {activeTab === 'browse' ? (
          <>
            {/* Search */}
            <View style={s.searchContainer}>
              <SearchInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search books by title, author, ISBN..."
              />
            </View>

            {/* Category Filter */}
            <FlatList
              data={CATEGORIES}
              horizontal
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.categoryList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(item);
                  }}
                  style={[s.categoryChip, category === item && { backgroundColor: colors.primary }]}
                >
                  <Text
                    style={[
                      s.categoryChipText,
                      { color: category === item ? '#fff' : colors.mutedForeground },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />

            <Text style={s.sectionTitle}>
              {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
            </Text>

            <FlatList
              data={filteredBooks}
              keyExtractor={(item) => item._id}
              renderItem={renderBookCard}
              style={s.listContainer}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
              }
              ListEmptyComponent={
                <EmptyView
                  icon="book"
                  title="No books found"
                  description={search ? 'Try a different search term' : 'No books in this category'}
                />
              }
            />
          </>
        ) : (
          <>
            <Text style={s.sectionTitle}>
              {issuedBooks.length} issued book{issuedBooks.length !== 1 ? 's' : ''}
            </Text>

            <FlatList
              data={issuedBooks}
              keyExtractor={(item) => item._id}
              renderItem={renderIssuedCard}
              style={s.listContainer}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
              }
              ListEmptyComponent={
                <EmptyView
                  icon="book-open"
                  title="No issued books"
                  description={isStudent ? 'You have no books issued' : 'No books are currently issued'}
                />
              }
            />
          </>
        )}
      </View>

      {/* Issue Modal */}
      <Modal
        visible={issueModal}
        transparent
        animationType="slide"
        onRequestClose={() => setIssueModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: colors.card }]}>
            <View style={s.modalHeader}>
              <View style={[s.modalIcon, { backgroundColor: colors.primary + '20' }]}>
                <Feather name="book-open" size={24} color={colors.primary} />
              </View>
              <Text style={s.modalTitle}>Issue Book</Text>
              <Text style={s.modalSubtitle} numberOfLines={2}>
                {selectedBook?.title}
              </Text>
            </View>

            {isLibrarian && (
              <View style={s.modalBody}>
                <Text style={s.inputLabel}>Student ID</Text>
                <TextInput
                  style={s.input}
                  value={studentId}
                  onChangeText={setStudentId}
                  placeholder="Enter student ID"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={s.bookDetails}>
              <Text style={s.detailLabel}>Author: {selectedBook?.author}</Text>
              <Text style={s.detailLabel}>
                Available: {selectedBook?.availableCopies}/{selectedBook?.totalCopies}
              </Text>
            </View>

            <View style={s.modalActions}>
              <Pressable
                style={[s.modalButton, { backgroundColor: colors.muted }]}
                onPress={() => {
                  setIssueModal(false);
                  setSelectedBook(null);
                  setStudentId('');
                }}
              >
                <Text style={[s.modalButtonText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  s.modalButton,
                  { backgroundColor: colors.primary },
                  processing && { opacity: 0.6 },
                ]}
                onPress={issueBook}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="check" size={18} color="#fff" />
                    <Text style={[s.modalButtonText, { color: '#fff' }]}>Issue</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    tabContent: { flex: 1, minHeight: 0 },
    listContainer: { flex: 1, minHeight: 0 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.foreground,
      letterSpacing: -0.4,
    },

    // Tabs
    tabSelector: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 4,
      gap: 4,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 9,
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.mutedForeground,
    },
    activeTabText: {
      color: '#fff',
    },

    // Search
    searchContainer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },

    // Categories
    categoryList: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 8,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // Books List
    sectionTitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: '600',
      paddingHorizontal: 16,
      marginBottom: 4,
    },
    list: {
      padding: 16,
      paddingTop: 8,
      gap: 12,
      paddingBottom: 32,
    },
    bookCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bookImageContainer: {
      width: 80,
      height: 110,
      flexShrink: 0,
    },
    bookImage: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
    },
    bookImagePlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bookInfo: {
      flex: 1,
      gap: 6,
    },
    bookTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.foreground,
      lineHeight: 20,
    },
    bookAuthor: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    bookIsbn: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    bookMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 2,
    },
    categoryBadge: {
      backgroundColor: colors.primary + '15',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    copiesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    copiesText: {
      fontSize: 11,
      fontWeight: '600',
    },
    issueButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      borderRadius: 10,
      marginTop: 4,
    },
    issueButtonText: {
      fontSize: 13,
      fontWeight: '700',
    },

    // Issued Cards
    issuedCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    overdueCard: {
      borderColor: '#ef4444',
      borderWidth: 2,
    },
    issuedHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    issuedInfo: {
      flex: 1,
      gap: 4,
    },
    issuedTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.foreground,
    },
    issuedAuthor: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    studentName: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    issuedDetails: {
      gap: 6,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    detailText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    dueBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      alignSelf: 'flex-start',
    },
    dueText: {
      fontSize: 12,
      fontWeight: '700',
    },
    fineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#ef4444' + '15',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
    },
    fineText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#ef4444',
    },
    returnButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
    },
    returnButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
    },

    // Issue Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      gap: 20,
    },
    modalHeader: {
      alignItems: 'center',
      gap: 8,
    },
    modalIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.foreground,
    },
    modalSubtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontWeight: '500',
      textAlign: 'center',
    },
    modalBody: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foreground,
    },
    input: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.foreground,
      backgroundColor: colors.muted,
    },
    bookDetails: {
      backgroundColor: colors.muted,
      padding: 12,
      borderRadius: 12,
      gap: 6,
    },
    detailLabel: {
      fontSize: 13,
      color: colors.foreground,
      fontWeight: '500',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '700',
    },
  });
