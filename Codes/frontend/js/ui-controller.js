// UI Controller for CU PathFinder
// Manages all user interface interactions and state

class UIController {
    constructor() {
        this.currentPath = null;
        this.currentComparison = null;
        this.stops = [];
        this.isNavigating = false;
        
        // Initialize UI after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    // Initialize all UI components
    initialize() {
        console.log('🎮 Initializing UI Controller...');
        
        // Populate location selects
        this.populateLocationSelects();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup chat interface
        this.setupChatInterface();
        
        // Update statistics
        this.updateStatistics();
        
        console.log('✅ UI Controller initialized');
    }
    
    // Populate location dropdown menus
    populateLocationSelects() {
        const startSelect = document.getElementById('start-location');
        const endSelect = document.getElementById('end-location');
        
        if (!startSelect || !endSelect) return;
        
        const buildings = CampusData.utils.getAllBuildingNames();
        
        // Clear existing options (except placeholder)
        startSelect.innerHTML = '<option value="">Select starting location...</option>';
        endSelect.innerHTML = '<option value="">Select destination...</option>';
        
        // Group buildings by category
        const categorized = {};
        for (const [category, buildingList] of Object.entries(CampusData.categories)) {
            categorized[category] = buildingList.filter(building => buildings.includes(building));
        }
        
        // Add grouped options
        for (const [category, buildingList] of Object.entries(categorized)) {
            if (buildingList.length > 0) {
                // Create optgroup
                const startOptgroup = document.createElement('optgroup');
                startOptgroup.label = category;
                const endOptgroup = document.createElement('optgroup');
                endOptgroup.label = category;
                
                // Add buildings to optgroups
                buildingList.forEach(building => {
                    const startOption = document.createElement('option');
                    startOption.value = building;
                    startOption.textContent = building;
                    startOptgroup.appendChild(startOption);
                    
                    const endOption = document.createElement('option');
                    endOption.value = building;
                    endOption.textContent = building;
                    endOptgroup.appendChild(endOption);
                });
                
                startSelect.appendChild(startOptgroup);
                endSelect.appendChild(endOptgroup);
            }
        }
        
        console.log(`📍 Populated ${buildings.length} locations in dropdowns`);
    }
    
    // Setup all event listeners
    setupEventListeners() {
        // Pathfinding buttons
        const findPathBtn = document.getElementById('find-path-btn');
        const clearBtn = document.getElementById('clear-path-btn');
        
        if (findPathBtn) {
            findPathBtn.addEventListener('click', () => this.handleFindPath());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.handleClearPath());
        }
        
        // Stops management
        const addStopBtn = document.getElementById('add-stop-btn');
        if (addStopBtn) {
            addStopBtn.addEventListener('click', () => this.addStop());
        }
        
        // Map controls
        const centerMapBtn = document.getElementById('center-map-btn');
        const toggleMarkersBtn = document.getElementById('toggle-markers-btn');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        if (centerMapBtn) {
            centerMapBtn.addEventListener('click', () => {
                if (window.mapManager) {
                    window.mapManager.centerMap();
                }
            });
        }
        
        if (toggleMarkersBtn) {
            toggleMarkersBtn.addEventListener('click', () => {
                if (window.mapManager) {
                    const visible = window.mapManager.toggleMarkers();
                    toggleMarkersBtn.innerHTML = visible ? 
                        '<i class="fas fa-map-marker-alt"></i>' : 
                        '<i class="fas fa-eye-slash"></i>';
                }
            });
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                if (window.mapManager) {
                    window.mapManager.toggleFullscreen();
                }
            });
        }
        
        // Navigation panel controls
        const closeNavBtn = document.getElementById('close-nav-btn');
        const startNavBtn = document.getElementById('start-navigation-btn');
        
        if (closeNavBtn) {
            closeNavBtn.addEventListener('click', () => this.hideNavigationPanel());
        }
        
        if (startNavBtn) {
            startNavBtn.addEventListener('click', () => this.startNavigation());
        }
        
        // Modal controls
        const closeModalBtn = document.getElementById('close-modal-btn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.hideComparisonModal());
        }
        
        // Close modal when clicking outside
        const modal = document.getElementById('comparison-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideComparisonModal();
                }
            });
        }
        
        // Location select changes
        const startSelect = document.getElementById('start-location');
        const endSelect = document.getElementById('end-location');
        
        if (startSelect) {
            startSelect.addEventListener('change', () => this.onLocationChange());
        }
        
        if (endSelect) {
            endSelect.addEventListener('change', () => this.onLocationChange());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Custom events
        document.addEventListener('buildingSelected', (e) => {
            this.onBuildingSelected(e.detail.buildingName);
        });
        
        console.log('🎯 Event listeners setup complete');
    }
    
    // Setup chat interface
    setupChatInterface() {
        const chatInput = document.getElementById('chat-input');
        const chatSendBtn = document.getElementById('chat-send-btn');
        const chatMessages = document.getElementById('chat-messages');
        
        if (!chatInput || !chatSendBtn || !chatMessages) return;
        
        // Send message function
        const sendMessage = async () => {
            const message = chatInput.value.trim();
            if (!message) return;
            
            // Clear input
            chatInput.value = '';
            
            // Add user message to chat
            this.addChatMessage('user', message);
            
            // Show typing indicator
            this.showTypingIndicator();
            
            try {
                // Process message with chatbot
                const response = await chatBot.processMessage(message);
                
                // Remove typing indicator
                this.hideTypingIndicator();
                
                // Add bot response to chat
                this.addChatMessage('bot', response);
                
            } catch (error) {
                console.error('Chat error:', error);
                this.hideTypingIndicator();
                this.addChatMessage('bot', "I'm sorry, I encountered an error. Please try again.");
            }
        };
        
        // Event listeners
        chatSendBtn.addEventListener('click', sendMessage);
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Load initial bot message
        const history = chatBot.getHistory();
        if (history.length > 0) {
            history.forEach(msg => {
                this.addChatMessage(msg.sender, msg.content, false);
            });
        }
        
        console.log('💬 Chat interface setup complete');
    }
    
    // Update statistics display
    updateStatistics() {
        const totalLocations = document.getElementById('total-locations');
        const totalConnections = document.getElementById('total-connections');
        
        if (totalLocations) {
            totalLocations.textContent = Object.keys(CampusData.buildings).length;
        }
        
        if (totalConnections) {
            totalConnections.textContent = CampusData.connections.length;
        }
    }
    
    // Handle find path button click
    async handleFindPath() {
        const startSelect = document.getElementById('start-location');
        const endSelect = document.getElementById('end-location');
        
        const start = startSelect?.value;
        const end = endSelect?.value;
        const algorithm = 'A*'; // Fixed to A* algorithm
        
        if (!start || !end) {
            this.showNotification('Please select both start and end locations', 'warning');
            return;
        }
        
        if (start === end) {
            this.showNotification('Start and end locations cannot be the same', 'warning');
            return;
        }
        
        try {
            this.showLoading('Finding optimal path...');
            
            // Get stops
            const stops = this.getStops();
            
            // Find path using A* algorithm
            const result = await pathfindingEngine.findPath(start, end, stops);
            
            this.hideLoading();
            
            if (result.success) {
                // Display results
                this.displayPathResult(result);
                
                // Show on map
                if (window.mapManager) {
                    window.mapManager.displayPath(result);
                }
                
                // Show navigation panel
                this.showNavigationPanel(result);
                
                this.showNotification(`Path found! Distance: ${CampusData.utils.formatDistance(result.distance)}`, 'success');
            } else {
                this.showNotification('No path found between these locations', 'error');
            }
            
        } catch (error) {
            this.hideLoading();
            console.error('Pathfinding error:', error);
            this.showNotification('Error finding path: ' + error.message, 'error');
        }
    }
    
    // Handle clear path button click
    handleClearPath() {
        // Clear map
        if (window.mapManager) {
            window.mapManager.clearPath();
        }
        
        // Clear results
        this.clearResults();
        
        // Hide navigation panel
        this.hideNavigationPanel();
        
        // Clear stops
        this.clearStops();
        
        this.showNotification('Path cleared', 'info');
    }
    
    // Display path result in UI
    displayPathResult(result) {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) return;
        
        this.currentPath = result;
        
        const routeHtml = `
            <div class="route-result fade-in">
                <div class="route-header">
                    <h4><i class="fas fa-route"></i> Route Found</h4>
                    <span class="algorithm-badge">${result.algorithm}</span>
                </div>
                
                <div class="route-info">
                    <div class="info-item">
                        <div class="info-label">Distance</div>
                        <div class="info-value">${CampusData.utils.formatDistance(result.distance)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Walking Time</div>
                        <div class="info-value">${result.walkingTime}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Nodes Explored</div>
                        <div class="info-value">${result.nodesExplored}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Execution Time</div>
                        <div class="info-value">${result.executionTime}ms</div>
                    </div>
                </div>
                
                <div class="route-path">
                    <h4>Route Steps:</h4>
                    <div class="path-steps">
                        ${result.path.map((location, index) => `
                            <span class="path-step">${location}</span>
                            ${index < result.path.length - 1 ? '<span class="path-arrow">→</span>' : ''}
                        `).join('')}
                    </div>
                </div>
                
                <div class="route-actions">
                    <button class="btn btn-success" onclick="uiController.showNavigationPanel()">
                        <i class="fas fa-directions"></i> Start Navigation
                    </button>
                    <button class="btn btn-secondary" onclick="uiController.shareRoute()">
                        <i class="fas fa-share"></i> Share Route
                    </button>
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = routeHtml;
    }
    
    // Clear results display
    clearResults() {
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="result-placeholder">
                    <i class="fas fa-route"></i>
                    <p>Select start and end locations to find your path</p>
                </div>
            `;
        }
        this.currentPath = null;
    }
    
    // Show algorithm comparison modal
    showAlgorithmComparison(results) {
        const modal = document.getElementById('comparison-modal');
        const resultsContainer = document.getElementById('comparison-results');
        
        if (!modal || !resultsContainer) return;
        
        this.currentComparison = results;
        
        // Generate comparison table
        const tableHtml = `
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Algorithm</th>
                        <th>Distance</th>
                        <th>Nodes Explored</th>
                        <th>Execution Time</th>
                        <th>Optimal</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(result => `
                        <tr>
                            <td><strong>${result.algorithm}</strong></td>
                            <td>${result.error ? 'Error' : CampusData.utils.formatDistance(result.distance)}</td>
                            <td>${result.error ? '-' : result.nodesExplored}</td>
                            <td>${result.error ? '-' : result.executionTime + 'ms'}</td>
                            <td>${result.error ? '-' : (result.isOptimal ? '<span class="optimal-badge">✓ Optimal</span>' : '❌')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        resultsContainer.innerHTML = tableHtml;
        modal.classList.remove('hidden');
    }
    
    // Hide algorithm comparison modal
    hideComparisonModal() {
        const modal = document.getElementById('comparison-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    // Show navigation panel
    showNavigationPanel(result = this.currentPath) {
        if (!result) return;
        
        const panel = document.getElementById('navigation-panel');
        if (!panel) return;
        
        // Update navigation data
        const navDistance = document.getElementById('nav-distance');
        const navTime = document.getElementById('nav-time');
        const navAlgorithm = document.getElementById('nav-algorithm');
        const navStepsList = document.getElementById('nav-steps-list');
        
        if (navDistance) navDistance.textContent = CampusData.utils.formatDistance(result.distance);
        if (navTime) navTime.textContent = result.walkingTime;
        if (navAlgorithm) navAlgorithm.textContent = result.algorithm;
        
        if (navStepsList && result.steps) {
            navStepsList.innerHTML = result.steps.map((step, index) => `
                <div class="nav-step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-text">${step.instruction}</div>
                </div>
            `).join('');
        }
        
        // Show panel
        panel.classList.remove('hidden');
    }
    
    // Hide navigation panel
    hideNavigationPanel() {
        const panel = document.getElementById('navigation-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }
    
    // Start navigation mode
    startNavigation() {
        if (!this.currentPath) {
            this.showNotification('No route available for navigation', 'warning');
            return;
        }
        
        this.isNavigating = true;
        
        // Update button
        const startNavBtn = document.getElementById('start-navigation-btn');
        if (startNavBtn) {
            startNavBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Navigation';
            startNavBtn.onclick = () => this.stopNavigation();
        }
        
        this.showNotification('Navigation started! Follow the highlighted path.', 'success');
        
        // You could add GPS tracking, step-by-step guidance, etc. here
        console.log('🧭 Navigation started');
    }
    
    // Stop navigation mode
    stopNavigation() {
        this.isNavigating = false;
        
        // Update button
        const startNavBtn = document.getElementById('start-navigation-btn');
        if (startNavBtn) {
            startNavBtn.innerHTML = '<i class="fas fa-play"></i> Start Navigation';
            startNavBtn.onclick = () => this.startNavigation();
        }
        
        this.showNotification('Navigation stopped', 'info');
        console.log('🛑 Navigation stopped');
    }
    
    // Add intermediate stop
    addStop() {
        const stopsContainer = document.getElementById('stops-list');
        if (!stopsContainer) return;
        
        const stopIndex = this.stops.length;
        const stopId = `stop-${stopIndex}`;
        
        const stopHtml = `
            <div class="stop-item" data-stop-id="${stopId}">
                <select class="stop-select" data-stop-index="${stopIndex}">
                    <option value="">Select stop location...</option>
                    ${CampusData.utils.getAllBuildingNames().map(building => 
                        `<option value="${building}">${building}</option>`
                    ).join('')}
                </select>
                <button class="remove-stop-btn" onclick="uiController.removeStop('${stopId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        stopsContainer.insertAdjacentHTML('beforeend', stopHtml);
        this.stops.push({ id: stopId, location: null });
        
        // Add event listener to new select
        const newSelect = stopsContainer.querySelector(`[data-stop-id="${stopId}"] .stop-select`);
        if (newSelect) {
            newSelect.addEventListener('change', (e) => {
                this.stops[stopIndex].location = e.target.value;
            });
        }
    }
    
    // Remove intermediate stop
    removeStop(stopId) {
        const stopElement = document.querySelector(`[data-stop-id="${stopId}"]`);
        if (stopElement) {
            stopElement.remove();
        }
        
        this.stops = this.stops.filter(stop => stop.id !== stopId);
    }
    
    // Get current stops
    getStops() {
        return this.stops.map(stop => stop.location).filter(Boolean);
    }
    
    // Clear all stops
    clearStops() {
        const stopsContainer = document.getElementById('stops-list');
        if (stopsContainer) {
            stopsContainer.innerHTML = '';
        }
        this.stops = [];
    }
    
    // Add message to chat
    addChatMessage(sender, content, scroll = true) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageHtml = `
            <div class="chat-message ${sender}-message fade-in">
                <div class="message-avatar">
                    <i class="fas fa-${sender === 'bot' ? 'robot' : 'user'}"></i>
                </div>
                <div class="message-content">
                    <p>${this.formatChatMessage(content)}</p>
                </div>
            </div>
        `;
        
        chatMessages.insertAdjacentHTML('beforeend', messageHtml);
        
        if (scroll) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Format chat message content
    formatChatMessage(content) {
        return content
            .replace(/\\n/g, '<br>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/•/g, '<span style="margin-right: 8px;">•</span>')
            .replace(/🤖|🛣️|📏|🚶|🧠|📊|📍|🏆|✅|❌|🗺️|💬|🎯|🔍|⏱️|📈/g, '<span class="emoji">$&</span>');
    }
    
    // Show typing indicator
    showTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const typingHtml = `
            <div class="chat-message bot-message typing-indicator">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="typing-animation">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.insertAdjacentHTML('beforeend', typingHtml);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Hide typing indicator
    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Show loading overlay
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            const messageElement = overlay.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            overlay.classList.remove('hidden');
        }
    }
    
    // Hide loading overlay
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
    
    // Show notification
    showNotification(message, type = 'info', duration = 4000) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notificationId = 'notification-' + Date.now();
        const notificationHtml = `
            <div class="notification ${type}" id="${notificationId}">
                <div class="notification-header">
                    <h4 class="notification-title">${this.getNotificationTitle(type)}</h4>
                    <button class="notification-close" onclick="uiController.hideNotification('${notificationId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="notification-message">${message}</p>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', notificationHtml);
        
        // Show notification
        setTimeout(() => {
            const notification = document.getElementById(notificationId);
            if (notification) {
                notification.classList.add('show');
            }
        }, 100);
        
        // Auto-hide after duration
        setTimeout(() => {
            this.hideNotification(notificationId);
        }, duration);
    }
    
    // Hide notification
    hideNotification(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }
    
    // Get notification title by type
    getNotificationTitle(type) {
        const titles = {
            'success': 'Success',
            'error': 'Error',
            'warning': 'Warning',
            'info': 'Information'
        };
        return titles[type] || 'Notification';
    }
    
    // Handle location selection changes
    onLocationChange() {
        const startSelect = document.getElementById('start-location');
        const endSelect = document.getElementById('end-location');
        
        const start = startSelect?.value;
        const end = endSelect?.value;
        
        // Update chatbot context
        if (start || end) {
            chatBot.setContext({
                lastStart: start || chatBot.getContext().lastStart,
                lastEnd: end || chatBot.getContext().lastEnd
            });
        }
        
        // Enable/disable find path button
        const findPathBtn = document.getElementById('find-path-btn');
        const compareBtn = document.getElementById('compare-algorithms-btn');
        
        if (findPathBtn) {
            findPathBtn.disabled = !start || !end;
        }
        
        if (compareBtn) {
            compareBtn.disabled = !start || !end;
        }
    }
    
    // Handle building selection from map
    onBuildingSelected(buildingName) {
        console.log(`🏢 Building selected: ${buildingName}`);
        
        // You could implement quick actions here
        // For example, auto-fill the destination if only start is selected
        const startSelect = document.getElementById('start-location');
        const endSelect = document.getElementById('end-location');
        
        if (startSelect && endSelect) {
            if (!startSelect.value) {
                startSelect.value = buildingName;
                this.onLocationChange();
            } else if (!endSelect.value && startSelect.value !== buildingName) {
                endSelect.value = buildingName;
                this.onLocationChange();
            }
        }
    }
    
    // Handle keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Ctrl+Enter: Find path
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            this.handleFindPath();
        }
        
        // Escape: Clear path/close modals
        if (event.key === 'Escape') {
            const modal = document.getElementById('comparison-modal');
            if (modal && !modal.classList.contains('hidden')) {
                this.hideComparisonModal();
            } else {
                this.handleClearPath();
            }
        }
        
        // Ctrl+M: Toggle markers
        if (event.ctrlKey && event.key === 'm') {
            event.preventDefault();
            if (window.mapManager) {
                window.mapManager.toggleMarkers();
            }
        }
    }
    
    // Share route functionality
    shareRoute() {
        if (!this.currentPath) {
            this.showNotification('No route to share', 'warning');
            return;
        }
        
        const routeText = `CU PathFinder Route:\\n` +
                         `From: ${this.currentPath.path[0]}\\n` +
                         `To: ${this.currentPath.path[this.currentPath.path.length - 1]}\\n` +
                         `Distance: ${CampusData.utils.formatDistance(this.currentPath.distance)}\\n` +
                         `Walking Time: ${this.currentPath.walkingTime}\\n` +
                         `Algorithm: ${this.currentPath.algorithm}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'CU PathFinder Route',
                text: routeText
            });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(routeText).then(() => {
                this.showNotification('Route copied to clipboard', 'success');
            });
        } else {
            this.showNotification('Sharing not supported', 'warning');
        }
    }
    
    // Get current UI state
    getState() {
        return {
            currentPath: this.currentPath,
            currentComparison: this.currentComparison,
            stops: this.stops,
            isNavigating: this.isNavigating
        };
    }
    
    // Set UI state
    setState(state) {
        this.currentPath = state.currentPath || null;
        this.currentComparison = state.currentComparison || null;
        this.stops = state.stops || [];
        this.isNavigating = state.isNavigating || false;
    }
}

// Create global UI controller instance
const uiController = new UIController();

// Make it available globally
window.uiController = uiController;