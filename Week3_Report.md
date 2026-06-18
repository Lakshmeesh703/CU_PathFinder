# CU PathFinder – Week 3 Development & Implementation Report

| **Aspect**      | **Week 1: Project Understanding & Planning**                                                                                                   | **Week 2: System Design & Architecture**                                                                                                   | **Week 3: Development & Implementation**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Objectives**  | - Finalize project title & abstract<br>- Write introduction, problem statement, objectives, scope<br>- Collect requirements<br>- Literature review<br>- Finalize tools & technologies | - Prepare system architecture diagram<br>- Define modules/features<br>- Database schema design<br>- Write methodology section             | - Build a functional prototype of the chatbot system<br>- Integrate NLP for user queries (FAQs, navigation)<br>- Implement navigation/pathfinding module<br>- Connect chatbot with campus database<br>- Ensure seamless integration of all modules                                                                                                                                                                                                                                                                            |
| **Tasks**       | - Decide project name and write abstract<br>- Draft intro, problem, objectives, scope<br>- Gather campus maps, department details, FAQs<br>- Research similar systems<br>- List tools | - Draw architecture diagram (User → Bot → Database → Map API)<br>- Define UI, NLP, Navigation, Database modules<br>- Design database tables | - Develop chatbot UI in Tkinter<br>- Develop API using Flask<br>- Implement user input, chat window, map display<br>- Integrate rule-based and AI-driven NLP<br>- Add intent recognition for FAQs, navigation, info<br>- Integrate BFS, DFS, UCS, A* algorithms<br>- Enable source/destination<br>- Display route, distance, time, directions<br>- Connect to campus database for staff, department, facility info<br>- Handle errors and edge cases<br>- Test integration of all modules |
| **Deliverables**| - Project synopsis draft<br>- Requirement document<br>- Tool/technology list                                                                  | - System architecture & block diagram<br>- Defined modules & features<br>- Database design            | - Prototype chatbot (answers FAQs, gives directions)<br>- Working database connection<br>- Navigation integration (with pathfinding)<br>- Integrated UI for all features                                                                                                                                                                                                                                                                                                          |
| **Documentation**| - Write and organize synopsis sections<br>- Document requirements and tools                                                                  | - Document architecture and modules<br>- Add database schema diagrams                                | - Update code comments and docstrings<br>- Document implementation steps and challenges<br>- Add screenshots of prototype<br>- Summarize integration and next steps for Week 4                                                                                                                                                                                                                                                             |

---

## **Week 3 Detailed Progress**

### 1. Chatbot Interface
- Designed a Tkinter-based UI with chat window, map display, and results area.
- Designed a Flask-based API with chat window, map display, and results area.
- Enabled user input and bot responses in real time.

### 2. NLP Integration
- Implemented both rule-based and AI-driven (DialoGPT) response logic.
- Recognizes intents for FAQs, navigation, and campus info.

### 3. Navigation Module
- Integrated BFS, DFS, UCS, and A* algorithms for pathfinding.
- Users can select source and destination
- Displays route, distance, estimated time, and step-by-step directions.

### 4. Database Connection
- Connected chatbot to campus database for dynamic info (staff, departments, facilities).
- Handles missing or incomplete data gracefully.

### 5. Module Integration & Testing
- Ensured smooth communication between UI, NLP, navigation, and database.
- Added error handling for invalid queries and unavailable routes.
- Performed integration testing for all features.

---

## **What We Are Doing in the Final (Week 4 – Testing & Finalization)**

- **Comprehensive Testing:**  
  Test chatbot responses for accuracy and relevance. Validate navigation paths for all major campus locations (classrooms, hostels, library, etc.).

- **UI Refinement:**  
  Refine and polish the user interface for better usability and appearance.

- **Documentation Completion:**  
  Write the Expected Outcome, Applications, Conclusion, and References sections for the final synopsis report.

- **Final Report Preparation:**  
  Compile all project documentation, diagrams, and code into a complete final report.

- **Project Demonstration:**  
  Prepare and rehearse a demonstration of the working prototype, showcasing all major features and answering sample queries.

- **Deliverables:**  
  - Fully prepared and formatted synopsis (all sections completed)
  - Working demo/prototype of “Bot Brain” campus navigator
  - Final report submission

---

**Summary:**  
Week 3 focused on turning the design into a working prototype. The chatbot now answers campus questions, provides directions, and integrates all modules. The system is ready for comprehensive testing, refinement, and final documentation in Week 4.