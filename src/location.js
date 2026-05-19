// --- 1. DATA DICTIONARY ---
export const buildingMap = {
    // this is staring of cbt center doors and gates and cbt itself
    "cbt_upstairs": {
        body: "cbt_center_upstairs",  // This is your Empty Axis or Door name
        slicerTarget: "annex",     // The solid building mesh to slice
        useSlicer: true,   
        displayName: "Ict/cbt Software unit",
        description: "This unit's office is the second office to your left, you will see lots of desktop arranged before you, look to your left and go to the second office. This unit Configures and manages the secure infrastructure for Computer-Based Testing (CBT). Oversees examination software setup, question deployment, and real-time result compilation for university and screening exams."
    },
    // e-lib  and its various doors
    "e-lib-door2": {
        body: "e-lib_inner_door1",  // This is your Empty Axis or Door name
        slicerTarget: "e-lib",
        useSlicer: true,
        sliceOffset: 2.5,
        displayName: "E-library",
        description: "For students to study in."
    },
    "e-lib-door4": {
        body: "e-lib_inner_door3",  // This is your Empty Axis or Door name
        slicerTarget: "e-lib",
        useSlicer: true,
        sliceOffset: 2.5,
        displayName: "Server room and Engineering unit",
        description: "This unit manages campus internet infrastructure, server uptime, and network security. Oversees payment gateway integrations for secure transaction processing of school fees and past-session payments."
    },
    "e-lib-door5": {
        body: "e-lib_inner_door5",  // This is your Empty Axis or Door name
        slicerTarget: "e-lib",
        useSlicer: true,
        sliceOffset: 2.5,
        displayName: "Director of ICT",
        description: ""
    },
    "e-lib-door6": {
        body: "e-lib_inner_door6",  // This is your Empty Axis or Door name
        slicerTarget: "e-lib",
        useSlicer: true,
        sliceOffset: 2.5,
        displayName: "Software unit",
        description: "This unit manages the university portal, student registration profiles, course enrollment data, and academic record databases. Resolves user profile glitches and database synchronization errors and uploading of results."
    },
    // health center and their various doors
    "healthcenterdoor1": {
        body: "healthcenter_door1",  // This is your Empty Axis or Door name
        displayName: "healthcenter",
        description: "Here, you get medical treament for minor sickness and medical issues, complex issues should be taken to UNIMED LAJE with a referral from the health center, it is advisable to have your NHIS as this can reduce student expenses. 100lv students must submit a copy of medical fee receipt and x-ray done in laje to the health center as well."
    },
     "healthcenterdoor2": {
        body: "healthcenter_door2",  // This is your Empty Axis or Door name
        displayName: "Pharmacy",
        description: "This is where you will be given drugs based on doctor's prescription."
    },
    // chapel and its various doors
     
    "chapel_itself": {
        body: "chapel",  // This is your Empty Axis or Door name
        displayName: "Chapel",
        description: "Tutorials, classes and other activities are held here, students read here during night class as well"
    },
    // school laboratory doors
     "office_1": {
        body: "office1",  // This is your Empty Axis or Door name
        displayName: "Pyhiscs Lecturer",
        description: "Dr Ay, Dr. Ogundele, Dr. Adekanle are one of the many physics lecturer taking 100lv students, this is their office location, if you have any issues in relation to any course being taken by phyics lectureres, you can relay such issues through your class rep or go to them directly, you can also ask them for directions to the rest of the lecturers taking you, whose names i was unfortunately unable to attain."
    },
    "physics": {
        body: "physics_lab",  // This is your Empty Axis or Door name
        displayName: "physics lab",
        description: "For physics students to have classes and frequent praticals. 100lv students do thier physics praticals here as well."
    },
    "office_13": {
        body: "office13",  // This is your Empty Axis or Door name
        displayName: "Faculty Of Science",
        description: "Every 100lv is subject to faculty of science, every 100lv must submit a file to this faculty, and then another file to their respective departments and issues pertaining to lectures must be taken to this department, preferably through the class governor."
    },
    "office_10": {
        body: "office10",  // This is your Empty Axis or Door name
        displayName: "Department of Mathematical and Computer Scienece",
        description: "Dr. Famutimi Rantiola is the Hod of this department,. This is his office location. Computer science, information technology and any other course being studied by students that is within this department, must submit one file to this department."
    },
    "biology": {
        body: "biology_lab",  // This is your Empty Axis or Door name
        displayName: "biology lab",
        description: "For biology students to have classes and frequent praticals. 100lv students do thier biology praticals here as well."
    },
    "office_12": {
        body: "office12",  // This is your Empty Axis or Door name
        displayName: "Department Of Physics",
        description: "Dr. Ayodele is the Hod of this departemnt, this is his office location. Physics, medical physics and any other course being studied by students that is within this department, must submit one file to this department."
    },
    "office_9": {
        body: "office9",  // This is your Empty Axis or Door name
        displayName: "Department Of Chemistry",
        description: "Dr. Ageyemi is the Hod of this department and this is his office, 100lv chemisty students and students offering related courses whose course is under this department should submit one file to this department."
    },
    "office_15": {
        body: "office15",  // This is your Empty Axis or Door name
        displayName: "Statistics",
        description: "Dr. Okunlola takes statistics for 100lv students, this is his office location."
    },
    "office_17": {
        body: "office17",  // This is your Empty Axis or Door name
        displayName: "Mathematics",
        description: "This is Dr. Akinsumande's office, he and five other math lectures take 100lv students mathematics courses.if you have any issues in relation to any course being taken by math lectureres, you can relay such issues through your class rep or go to them directly, you can also ask them for directions to the rest of the lecturers taking you, whose names i was unfortunately unable to attain."
    },
    "chemistry": {
        body: "chemistry_lab",  // This is your Empty Axis or Door name
        displayName: "chemistry lab",
        description: "For chemistry students to have classes and frequent praticals. 100lv students do thier chemisty praticals here as well."
    },
    "office_21": {
        body: "office21",  // This is your Empty Axis or Door name
        displayName: "Biology/Chemistry",
        description: "Professor Oyeyemi takes 100lv students biology, this is his office location, as well as Dr. Oredepo who takes 100lv students chemistry. If you have any issues in relation to any course being taken by phyics lectureres, you can relay such issues through your class rep or go to them directly, you can also ask them for directions to the rest of the lecturers taking you, whose names i was unfortunately unable to attain."
    },
    "lib-rary": {
        body: "library",  // This is your Empty Axis or Door name
        displayName: "library",
        description: "Students study here."
    },
    "micro": {
        body: "graduate",  // This is your Empty Axis or Door name
        displayName: "Microbilogy lab",
        description: "For microbiology students to have classes and frequent praticals."
    },
     "grad": {
        body: "EMT",  // This is your Empty Axis or Door name
        displayName: "EMT lab",
        description: "For emt students to have classes and frequent praticals."
    },
    "office_38": {
        body: "office38",  // This is your Empty Axis or Door name
        displayName: "Department of Biology/ Biotechnology",
        description: "Dr. Ayeko is the Hod of this department and this is his office, 100lv biology students and students offering related courses whose course is under this department should submit one file to this department."
    },
     "read": {
        body: "rd",  // This is your Empty Axis or Door name
        displayName: "SLT lab",
        description: "For slt students to have classes and frequent praticals."
    },
    "slt": {
        body: "slt-clssrm",  // This is your Empty Axis or Door name
        displayName: "SLT Classroom",
        description: "For slt students to have classes."
    },
     "fd-sci": {
        body: "food-sci-classroom",  // This is your Empty Axis or Door name
        displayName: "Food Science lab",
        description: "For food science students to have classes and praticals."
    },
     "fd": {
        body: "fd_science",  // This is your Empty Axis or Door name
        displayName: "Glass Blowing lab",
        description: ""
    },
   "hnd": {
        body: "hnd lab2",  // This is your Empty Axis or Door name
        displayName: "HND lab",
        description: "For hnd students to have classes and frequent praticals."
    },
    // the hall and its various doors
     "hall": {
        body: "Hall",  // This is your Empty Axis or Door name
        displayName: "school hall",
        description: "Where students hold their lectures and events like orientattion, convocations are mostly held."
    },
     "hall-ges": {
        body: "ges",  // This is your Empty Axis or Door name
        displayName: "French",
        description: "The offices of Dr. Agbaje and Dr. Iwabi are upstairs to the right, they take 100lv students french and Dr. Babs takes Enterpreneur, his office is located within the minimart to the right.NOTE: Minimart was not included in the admin in this website for minimization sake."
    },
    // admin and it"s various offices
     "admin": {
        body: "Admin",
        displayName: "Administrative Block",
        description: "Adminisrative activities are carried out here."
    },
     "admin door1": {
        body: "admin_inner_door6",          
        toLift: ["admin_roof"],
        displayName: "Head of Cash Management",
        description: "Also office of the vc(odosida)"
    },
     "admin door2": {
        body: "admin_inner_door7",          
        toLift: ["admin_roof"],
        displayName: "Dean of PG School",
        description: "Dean of post graduate students."
    },
     "admin door3": {
        body: "admin_inner_door8",          
        toLift: ["admin_roof"],
        displayName: "Toilet",
        description: "Toilet for staffs."
    },
     "admin door4": {
        body: "admin_inner_door9",          
        toLift: ["admin_roof"],
        displayName: "Student Accounting Office",
        description: "Students make payments here."
    },
     "admin door5": {
        body: "admin_inner_door10",          
        toLift: ["admin_roof"],
        displayName: "Student Bursary",
        description: "Students make compliants concerning payments here."
    },
     "admin door6": {
        body: "admin_inner_door11",          
        toLift: ["admin_roof"],
        displayName: "Pg Conference Room",
        description: ""
    },
     "admin door7": {
        body: "admin_inner_door12",          
        toLift: ["admin_roof"],
        displayName: "Finance(staff)",
        description: "Mainly for staffs."
    },
     "admin door8": {
        body: "admin_inner_door1",          
        toLift: ["admin_roof"],
        displayName: "Bursary Department(not necessairly for students)",
        description: "Processes the salaries of everyone, students and staffs etc. All student issues concerning payment are made to the STUDENT BURSARY"
    },
     "admin door9": {
        body: "admin_inner_door5",          
        toLift: ["admin_roof"],
        displayName: "Accounting Division(staffs)",
        description: "Payroll payment for staffs."
    },
      "admin door10": {
        body: "admin_inner_door2",          
        toLift: ["admin_roof", "cover1", "cover2", "upstairs_floor"],
        useSlicer: true,
        slicerTargets: ["admin_part1", "admin_part2"],
        displayName: "Dean of Student Affairs",
        description: "Responsible for students. 100lv students lodge complaints concerning lectures to the faculty of science."
    },
     "admin door11": {
        body: "admin_inner_door3",          
        toLift: ["admin_roof", "cover1", "cover2", "upstairs_floor"],
        useSlicer: true,
        slicerTargets: ["admin_part1", "admin_part2"],
        displayName: "Student Affairs",
        description: "In charge of students, 100lv submits four files to this office to be signed, then gives only one of the files to this office. Also in charge of students accomodation, orientations, complaints, nysc mobilation. students issues should be taken to the student affairs office for prompt solving."
    },
     "admin door12": {
        body: "admin_inner_door4",          
        toLift: ["admin_roof", "cover1", "cover2", "upstairs_floor"],
        useSlicer: true,
        slicerTargets: ["admin_part1", "admin_part2"],
        displayName: "PG school office",
        description: "Solely responsible for post graduate students.",
    }
};