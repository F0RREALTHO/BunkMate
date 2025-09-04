package com.example.bunkmate.Controllers;

import com.example.bunkmate.Model.Student;
import com.example.bunkmate.Model.Subject;
import com.example.bunkmate.Service.JWTService;
import com.example.bunkmate.Service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
//@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService  jwtService;

    @GetMapping("/student/{studentName}")
    public ResponseEntity<?> getAllSubjects(@PathVariable String studentName) {
        try {
            Student student = studentService.getStudent(studentName);
            return new ResponseEntity<>(student.getSubjects(), HttpStatus.OK);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>("User Not Found", HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/student")
    public ResponseEntity<?> registerStudent(@RequestBody Student student) {
        try {
            Student registeredStudent = studentService.registerUser(student);
            return new ResponseEntity<>(Map.of("message", "Student registered successfully"), HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.CONFLICT);
        }
    }

    @PostMapping("/student/login")
    public ResponseEntity<?> login(@RequestBody Student student) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(student.getName(), student.getPassword())
            );
            String token = jwtService.generateToken(student.getName());
//            System.out.println(token);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Invalid username or password"), HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/student/{studentName}/subject")
    public ResponseEntity<?> addSubject(@PathVariable String studentName, @RequestBody Subject subjectDta) {
        try{
            Student updatedStudent = studentService.addSubject(studentName,subjectDta);
            return new ResponseEntity<>(updatedStudent.getSubjects(), HttpStatus.OK);
        }catch (IllegalStateException e){
            return new ResponseEntity<>("User/Subject Not Found", HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/student/{studentName}/subject/{subjectName}")
    public ResponseEntity<?> deleteSubject(@PathVariable String studentName, @PathVariable String subjectName) {
        try {
            Student updatedStudent = studentService.deleteSubject(studentName,subjectName);
            return new ResponseEntity<>(updatedStudent.getSubjects(), HttpStatus.OK);
        }catch (IllegalStateException e){
            return new ResponseEntity<>("User/Subject Not Found", HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/student/{studentName}")
    public ResponseEntity<?> deleteStudent(@PathVariable String studentName) {
        try {
            Student deletedStudent = studentService.deleteStudent(studentName);
            return new ResponseEntity<>(Map.of(
                    "message", "Student deleted successfully",
                    "deletedStudent", deletedStudent.getName()
            ), HttpStatus.OK
            );
        }catch (IllegalStateException e){
            return new ResponseEntity<>(Map.of
                    ("error", "User/Student Not Found"),
                    HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/student/{studentName}/subject/{subjectName}/attended/inc")
    public ResponseEntity<?> increaseAttendance(@PathVariable String studentName, @PathVariable String subjectName) {
        try{
            Subject updatedSubject = studentService.updateAttendance(studentName,subjectName,1,0);
            return new ResponseEntity<>(updatedSubject, HttpStatus.OK);
        }catch (IllegalStateException e){
            return new ResponseEntity<>("User/Subject Not Found", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/student/{studentName}/subject/{subjectName}/attended/dec")
    public ResponseEntity<?> decreaseAttendance(@PathVariable String studentName, @PathVariable String subjectName) {
        try{
            Subject updatedSubject = studentService.updateAttendance(studentName,subjectName,-1,0);
            return new ResponseEntity<>(updatedSubject, HttpStatus.OK);
        }catch (IllegalStateException e){
            return new ResponseEntity<>("User/Subject Not Found", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/student/{studentName}/subject/{subjectName}/missed/inc")
    public ResponseEntity<?> increaseMissed(@PathVariable String studentName, @PathVariable String subjectName) {
        try{
            Subject updatedSubject = studentService.updateAttendance(studentName,subjectName,0,1);
            return new ResponseEntity<>(updatedSubject, HttpStatus.OK);
        }catch (IllegalStateException e){
            return new ResponseEntity<>("User/Subject Not Found", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/student/{studentName}/subject/{subjectName}/missed/dec")
    public ResponseEntity<?> decreaseMissed(@PathVariable String studentName, @PathVariable String subjectName) {
        try{
            Subject updatedSubject = studentService.updateAttendance(studentName,subjectName,0,-1);
            return new ResponseEntity<>(updatedSubject, HttpStatus.OK);
        }catch (IllegalStateException e){
            return new ResponseEntity<>("User/Subject Not Found", HttpStatus.NOT_FOUND);
        }
    }

}
