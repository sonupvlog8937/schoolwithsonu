import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../../../environment";
import "./StudentDetails.css"

const formatAadhar = (raw) => {
  const s = String(raw || "").replace(/\D/g, "");
  if (s.length !== 12) return raw?.trim() || "N/A";
  return `${s.slice(0, 4)} ${s.slice(4, 8)} ${s.slice(8, 12)}`;
};

export default function StudentDetails(){
    const [student, setStudent] = useState(null)
    const getImageSrc = (imagePath) => {
        if (!imagePath) return "";
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
          return imagePath;
        }
        return `/images/uploaded/student/${imagePath}`;
      };

    const getStudentDetails = ()=>{
        axios.get(`${baseUrl}/student/fetch-own`).then(resp=>{
            setStudent(resp.data.data)
    console.log("student",  resp)
        }).catch(e=>{
            console.log("Error in student", e)
        })
    }

    useEffect(()=>{
        getStudentDetails()
    },[])
    return(
        <>
                <Typography variant="h3"  sx={{textAlign:'center',marginBottom:"15px" }}>Student Details</Typography>
                {student && <>

                    <Box component={"div"} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",padding:"5px" }}>
                             <img src={getImageSrc(student.student_image)} alt='image' height={'370px'} width={'450px'} style={{borderRadius:"50%"}} />
                        </Box>
                    <TableContainer sx={{margin:"auto", width:"80%",border:'1px solid transparent',  borderRadius:"17px", boxShadow:"0 10px 8px -5px lightgray"
                    }} component={'div'}>
                  <Table sx={{ minWidth: 250 }} aria-label="simple table">
                    <TableBody>
                        <TableRow>
                        <TableCell className="table-cell" align="left">
                          Email
                        </TableCell>
                        <TableCell className="table-cell" align="left" >
                            {student.email}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                          Name
                        </TableCell>
                        <TableCell className="table-cell" align="left" >
                            {student.name}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                          Roll Number
                        </TableCell>
                        <TableCell className="table-cell" align="left" >
                            {student.roll_number || "N/A"}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                          Address
                        </TableCell>
                        <TableCell className="table-cell" align="left" sx={{ whiteSpace: "pre-wrap" }}>
                            {student.address?.trim() || "N/A"}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                          Aadhar number
                        </TableCell>
                        <TableCell className="table-cell" align="left" sx={{ fontFamily: "monospace" }}>
                            {formatAadhar(student.aadhar_number)}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Class
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                         {student.student_class.class_text}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Age
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                         {student.age}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Gender
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                         {student.gender}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Guardian
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                        {student.guardian}
                         </TableCell>
                      </TableRow>

                    </TableBody>
                  </Table>
                </TableContainer>
                </>}
              
        
        </>
    )
}