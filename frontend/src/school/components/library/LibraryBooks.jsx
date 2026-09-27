import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Add, Edit, Delete, Search } from "@mui/icons-material";
import axios from "axios";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

const LibraryBooks = () => {
  useDocumentTitle("Library Books");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    book_title: "",
    book_number: "",
    isbn: "",
    author: "",
    publisher: "",
    category: "General",
    quantity: 1,
    available_quantity: 1,
    rack_number: "",
    price: 0,
    description: "",
  });

  useEffect(() => {
    fetchBooks();
  }, [searchTerm]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await axios.get("/api/library/book/all", { params });
      setBooks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
      setSnackbar({ open: true, message: "Error fetching books", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (book = null) => {
    if (book) {
      setSelectedBook(book);
      setFormData({
        book_title: book.book_title || "",
        book_number: book.book_number || "",
        isbn: book.isbn || "",
        author: book.author || "",
        publisher: book.publisher || "",
        category: book.category || "General",
        quantity: book.quantity || 1,
        available_quantity: book.available_quantity || 1,
        rack_number: book.rack_number || "",
        price: book.price || 0,
        description: book.description || "",
      });
    } else {
      setSelectedBook(null);
      setFormData({
        book_title: "",
        book_number: "",
        isbn: "",
        author: "",
        publisher: "",
        category: "General",
        quantity: 1,
        available_quantity: 1,
        rack_number: "",
        price: 0,
        description: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBook(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedBook) {
        await axios.put(`/api/library/book/${selectedBook._id}`, formData);
        setSnackbar({ open: true, message: "Book updated successfully", severity: "success" });
      } else {
        await axios.post("/api/library/book/add", formData);
        setSnackbar({ open: true, message: "Book added successfully", severity: "success" });
      }
      handleCloseDialog();
      fetchBooks();
    } catch (error) {
      console.error("Error saving book:", error);
      setSnackbar({ open: true, message: "Error saving book", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axios.delete(`/api/library/book/${id}`);
        setSnackbar({ open: true, message: "Book deleted successfully", severity: "success" });
        fetchBooks();
      } catch (error) {
        console.error("Error deleting book:", error);
        setSnackbar({ open: true, message: "Error deleting book", severity: "error" });
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Library Books</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Book
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by title, author, or ISBN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No books found
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow key={book._id}>
                    <TableCell>{book.book_number}</TableCell>
                    <TableCell>{book.book_title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.category}</TableCell>
                    <TableCell>{book.quantity}</TableCell>
                    <TableCell>{book.available_quantity}</TableCell>
                    <TableCell>
                      <Chip
                        label={book.status}
                        color={book.status === "Available" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(book)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(book._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedBook ? "Edit Book" : "Add Book"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Book Title"
                value={formData.book_title}
                onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Book Number"
                value={formData.book_number}
                onChange={(e) => setFormData({ ...formData, book_number: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ISBN"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Rack Number"
                value={formData.rack_number}
                onChange={(e) => setFormData({ ...formData, rack_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedBook ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <CustomizedSnackbars
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default LibraryBooks;
