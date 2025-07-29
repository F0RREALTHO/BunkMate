package com.example.bunkmate.Service;

import com.example.bunkmate.Model.Student;
import com.example.bunkmate.Model.Subject;
import com.example.bunkmate.Repository.StudentRepo;
import com.example.bunkmate.Repository.SubjectRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class StudentService {
    private static final int DEFAULT_REQUIRED_PERCENTAGE = 75;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private SubjectRepo subjectRepo;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

//    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public Student registerUser(Student student) {
        if(studentRepo.findByName(student.getName()).isPresent()){
            throw new IllegalStateException("User with name " + student.getName() + " already exists.");
        }
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        return studentRepo.save(student);
    }

    public Student addSubject(String username, Subject subject) {
        Student student = studentRepo.findByName(username)
                .orElseThrow(()-> new IllegalStateException("User with name " + username + " does not exist"));

        Subject newSubject = new Subject();
        newSubject.setName(subject.getName());
        newSubject.setAttendedClasses(subject.getAttendedClasses());
        newSubject.setMissedClasses(subject.getMissedClasses());
        newSubject.setRequiredPercentage(subject.getRequiredPercentage());

        student.getSubjects().add(newSubject);

        return studentRepo.save(student);
    }

    public Subject updateAttendance(String studentName, String subjectName, int attendedChange, int missedChange) {
        Student student = studentRepo.findByName(studentName)
                .orElseThrow(()-> new IllegalStateException("User with name " + studentName + " does not exist"));

        Subject subjectToUpdate = student.getSubjects().stream()
                .filter(s -> s.getName().equalsIgnoreCase(subjectName))
                .findFirst()
                .orElseThrow(()-> new IllegalStateException("Subject not found with name: " + subjectName));

        subjectToUpdate.setAttendedClasses(subjectToUpdate.getAttendedClasses() + attendedChange);
        subjectToUpdate.setMissedClasses(subjectToUpdate.getMissedClasses() + missedChange);

//        calculateSubjectStats(subjectToUpdate);
        subjectToUpdate.calculateStats();

        studentRepo.save(student);
        return subjectToUpdate;
    }

    public Student deleteSubject(String studentName, String subjectName) {
        Student student = studentRepo.findByName(studentName)
                .orElseThrow(()-> new IllegalStateException("User with name " + studentName + " does not exist"));

        Subject subjectToUpdate = student.getSubjects().stream()
                .filter(s -> s.getName().equalsIgnoreCase(subjectName))
                .findFirst()
                .orElseThrow(()-> new IllegalStateException("Subject not found with name: " + subjectName));

        student.getSubjects().remove(subjectToUpdate);
        return studentRepo.save(student);
    }

//    private void calculateSubjectStats(Subject subjectToUpdate) {
//        int attendedClasses = subjectToUpdate.getAttendedClasses() != null ? subjectToUpdate.getAttendedClasses() : 0;
//        int missedClasses = subjectToUpdate.getMissedClasses()!= null ? subjectToUpdate.getMissedClasses() : 0;
//        int requiredPercentage = subjectToUpdate.getRequiredPercentage() != null ? subjectToUpdate.getRequiredPercentage() : DEFAULT_REQUIRED_PERCENTAGE;
//
//        int totalClasses = attendedClasses + missedClasses;
//        double requiredDecimal = requiredPercentage / 100.0;
//
//        if(totalClasses == 0){
//            subjectToUpdate.setCurrentAttendancePercentage(100.00);
//        }else{
//            double percentage = ((double)attendedClasses / (totalClasses)) * 100;
//            subjectToUpdate.setCurrentAttendancePercentage(Math.round(percentage*10.0)/10.0);
//        }
//
//        if(subjectToUpdate.getCurrentAttendancePercentage()< requiredPercentage) {
//            int needed = (int) Math.ceil((requiredDecimal * totalClasses - attendedClasses) / (1 - requiredDecimal));
//            subjectToUpdate.setClassesNeededToReachRequirements(needed);
//            subjectToUpdate.setClassesCanBeMissed(0);
//        }else{
//            int canBeMissed =(int) Math.floor((attendedClasses - requiredDecimal * totalClasses) / requiredDecimal);
//            subjectToUpdate.setClassesCanBeMissed(canBeMissed);
//            subjectToUpdate.setClassesNeededToReachRequirements(0);
//        }
//    }

    public Student getStudent(String studentName) {
        return studentRepo.findByName(studentName)
                .orElseThrow(()-> new IllegalStateException("User with name " + studentName + " does not exist"));
    }
}
