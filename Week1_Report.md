# CU PathFinder - Week 1 Planning & Requirements Report

## 1. Project Title
CU PathFinder: An AI-Powered Intelligent Campus Navigation and Information Agent for Chanakya University

## 2. Abstract
Navigating large university campuses is often challenging for new students, faculty, and visitors. CU PathFinder is an intelligent agent-based campus navigation system for Chanakya University that models the campus as a weighted graph of buildings and walking paths. It implements classical AI search algorithms (BFS, DFS, UCS, A*) to compute routes and compare efficiency. The system provides shortest/optimal paths, estimated walking time, and contextual building information (services, timings). It serves both as a practical assistant and as an educational platform demonstrating AI concepts such as agent architecture, search strategy evaluation, and PEAS analysis. Designed for extensibility, CU PathFinder can be enhanced with graphical visualization, alternative route recommendations, or service availability checks in later weeks.

## 3. Introduction
Modern higher education campuses are spatially distributed environments containing academic blocks, administrative offices, residential hostels, service centers, and recreational facilities. New students and visitors often waste time navigating manually or asking for directions. Static printed maps, while informative, lack interactivity, personalization, and decision support (e.g., fastest vs. alternate path). An AI-powered navigation assistant bridges this gap by combining search algorithms, structured environment modeling, and contextual knowledge about locations.

CU PathFinder leverages fundamental Artificial Intelligence concepts introduced in the early weeks of the course—problem formulation, state-space representation, uninformed and informed search, and agent design. By formalizing the campus as a graph where nodes represent buildings and weighted edges represent walking distances, we can computationally evaluate multiple route-finding strategies. The project not only solves a practical problem but also reinforces theoretical understanding through measurable algorithm comparison.

## 4. Problem Statement
Students and visitors at Chanakya University face difficulty locating buildings, services, and efficient walking routes—especially during orientation periods, examinations, and events. Without an interactive tool, they rely on static maps or peer assistance, leading to time loss, confusion, and reduced user experience. There is a need for an intelligent, query-driven system that:
- Accepts natural or structured navigation requests
- Computes and presents optimal or alternative paths
- Provides contextual building information (purpose, timings, services)
- Compares multiple search algorithms for transparency and education

## 5. Objectives
1. Model Chanakya University campus as a weighted graph of buildings and pedestrian paths.
2. Implement BFS, DFS, Uniform Cost Search, and A* for pathfinding between any two valid locations.
3. Develop an interactive (initially text-based, later GUI) user interface for route queries.
4. Provide building metadata: facilities, operating hours, and service descriptions.
5. Capture and compare algorithm performance (nodes explored, path length, distance, runtime potential).
6. Enable extensibility for enhancements (visualization, alternate paths, recommendations, closure handling).
7. Document the system design via agent analysis (PEAS), problem formulation, and algorithm rationale.

## 6. Scope
In-Scope:
- Chanakya University campus (≥12 core buildings: Academic Blocks A/B, Library, Admin, Main Gate, Hostel, Cafee, DG Room, Sports Complex, Medical Center, Auditorium + optional Security Office, Food Court,Crickrt Ground, Faculty Appartment, Water Treatment Area, Guest House, Pottry Making Area).
- Pedestrian path navigation using static distances (meters) and average walking time estimation.
- Search algorithm implementation and comparison.
- Text-based CLI + optional Tkinter desktop GUI (Week 2–3 refinement).
- Agent-oriented documentation (PEAS, environment classification, agent type justification).

Out-of-Scope (Week 1):
- Real-time GPS tracking or map API integration.
- Voice input or multi-language NLP.
- Dynamic path disruption (construction, crowd density) modeling.
- Mobile deployment or persistent user profiles.

Future Scope (Planned Extensions):
- Path alternatives and recommendation engine.
- Visual map rendering (matplotlib / networkx already scaffolded).
- Integration with campus events/room schedules.
- Offline caching + mobile-friendly packaging.
- Chatbot layer (Rasa/Dialogflow) for natural queries.

## 7. Requirement Analysis
### 7.1 Functional Requirements
| ID | Requirement | Description | Priority |
|----|-------------|------------|----------|
| FR1 | Campus Graph | System shall represent campus as a weighted undirected graph. | High |
| FR2 | Location Listing | System shall list all supported buildings. | High |
| FR3 | Pathfinding | System shall compute a valid path between any two distinct locations. | High |
| FR4 | Algorithms | System shall support BFS, DFS, UCS, A*. | High |
| FR5 | Algorithm Selection | User shall choose algorithm before search. | Medium |
| FR6 | Performance Metrics | System shall display total distance and nodes explored. | High |
| FR7 | Walking Time | System shall estimate walking time based on configurable speed. | Medium |
| FR8 | Building Info | System shall display metadata (services, timings) for each building. | High |
| FR9 | Comparison Mode | System shall compare algorithms on selected routes. | Medium |
| FR10 | Error Handling | Invalid inputs shall be gracefully reported. | High |
| FR11 | GUI (Enhancement) | Provide desktop GUI for offline use. | Medium |
| FR12 | Visualization (Enhancement) | Optionally render map and highlight path. | Low |

### 7.2 Non-Functional Requirements
| Category | Requirement |
|----------|------------|
| Usability | Simple menu-driven CLI and clean GUI layout. |
| Performance | Single query response < 1 second for current graph size. |
| Maintainability | Modular code: separate graph, algorithms, UI layers. |
| Extensibility | Easy addition of new buildings or algorithms. |
| Portability | Runs on macOS/Linux/Windows with Python 3.9+. |
| Reliability | Deterministic outputs for same inputs. |
| Documentation | README + Technical Report + inline comments. |

### 7.3 Data Requirements
- Building table: name, category, services, operating hours, coordinates.
- Edge list: (source, destination, distance in meters, directionality [future]).
- Configuration: average walking speed (default 80 m/min).


## 8. Literature & Related Systems Review
| System / Approach | Key Features | Relevance |
|-------------------|-------------|-----------|
| Google Maps Pedestrian Mode | Real-time routing, dynamic conditions | Inspires pathfinding and time estimation. |
| Indoor Campus Kiosk Systems | Touch-based building locators | Validates need for interactive local guidance. |
| Rasa/Dialogflow Chatbots | Intent detection & entity extraction | Future natural language extension. |
| A* Algorithm Studies | Optimal pathfinding with heuristics | Guides heuristic selection for campus model. |
| Academic Navigation Projects (GitHub) | Graph-based campus models | Confirms feasibility and common patterns. |

Findings: Most existing campus tools lack combined algorithm transparency + educational comparison. CU PathFinder differentiates by exposing search strategy internals for learning purposes.

## 9. Tools & Technology Stack (Planned)
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | Python 3.x | Rich standard library, fast prototyping. |
| Core Data Structures | dict, list, deque, heapq | Efficient for graph + search operations. |
| CLI | Built-in I/O | Simplicity, portability. |
| Desktop GUI | Tkinter | Bundled with Python, lightweight. |
| Visualization | matplotlib, networkx | Graph drawing & path highlighting. |
| Optional Chatbot (future) | Rasa / Dialogflow | Natural language query processing. |
| Packaging | requirements.txt | Reproducible environment. |
| Version Control | Git + GitHub | Collaboration & submission. |
| Documentation | Markdown (README / reports) | Lightweight and render-friendly. |

## 10. Risks & Mitigations
| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Tkinter not installed (macOS brew Python) | GUI failure | Medium | Provide install instructions / fallback CLI. |
| Scope Creep | Delay | Medium | Freeze Week 1 scope; schedule enhancements later. |
| Time Constraints | Reduced quality | Low | Weekly milestones and testing early. |
| Algorithm Bugs | Incorrect paths | Medium | Create test harness (already implemented). |
| Future NLP Complexity | Overhead | Medium | Defer chatbot to enhancement phase. |

## 11. Week 1 Deliverables Summary
| Deliverable | Status | File/Section |
|-------------|--------|-------------|
| Title & Abstract | Completed | Section 1–2 |
| Introduction | Completed | Section 3 |
| Problem Statement | Completed | Section 4 |
| Objectives | Completed | Section 5 |
| Scope | Completed | Section 6 |
| Requirements Document | Completed | Section 7 |
| Literature Review | Completed | Section 8 |
| Tool/Technology List | Completed | Section 9 |
| Risk Assessment | Completed | Section 10 |

## 12. Week 2 Preview (Planned Next Steps)
- Add GUI polish + validation improvements.
- Introduce alternate path generation (k-shortest simple variant).
- Prepare initial chatbot intent schema (if time).
- Begin drafting algorithm comparison automation export (CSV/JSON).

---
Prepared: Week 1 (27 Aug) – CU PathFinder Planning Report
