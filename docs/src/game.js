class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.setupCanvas();
        this.setupControls();
        
        // Movement controls
        this.position = 70; // Start closer to first layer (first layer is at 100)
        this.velocity = 0;
        this.maxSpeed = 0.36; // Doubled from 0.18
        this.acceleration = 0.009; // Doubled from 0.0045
        this.friction = 0.9;
        
        // Calculate distances based on time requirements
        // At max speed of 0.36, we travel about 1296 units per hour (assuming 60fps)
        this.blueLayerDistance = 12960; // 10 hours at max speed
        this.redLayerSpacing = 100; // Space between red layers
        
        this.keys = {
            w: false,
            s: false
        };
        
        // Load images
        this.loadImages();
        
        // Create objects at different depths
        this.setupObjects();
        
        // Walking bob effect
        this.walkCycle = 0;
        this.bobAmount = 0;
        this.swayAmount = 0;
        
        // Hill climbing effect
        this.hillOffset = 0;
        
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    loadImages() {
        this.images = {
            loaded: 0,
            total: 11 // sky + middle + field + 8 near layers
        };
        
        // Load sky background
        this.skyImage = new Image();
        this.skyImage.src = 'sky-background.png';
        this.skyImage.onload = () => {
            this.images.loaded++;
            console.log('Sky background loaded');
        };
        this.skyImage.onerror = () => {
            console.error('Failed to load sky-background.png');
        };
        
        // Load middle layer
        this.middleImage = new Image();
        this.middleImage.src = 'middle-layer.png?v=' + Date.now(); // Cache buster for new image
        this.middleImage.onload = () => {
            this.images.loaded++;
            console.log('Middle layer loaded');
        };
        this.middleImage.onerror = () => {
            console.error('Failed to load middle-layer.png');
        };
        
        // Load field layer
        this.fieldImage = new Image();
        this.fieldImage.src = 'field-layer.png?v=' + Date.now(); // Cache buster for new image
        this.fieldImage.onload = () => {
            this.images.loaded++;
            console.log('Field layer loaded');
        };
        this.fieldImage.onerror = () => {
            console.error('Failed to load field-layer.png');
        };
        
        // Load near layers
        this.nearLayers = [];
        // Load all 8 near layers
        for (let i = 1; i <= 8; i++) {
            const img = new Image();
            img.src = `near-layer-${i}.png?v=` + Date.now(); // Cache buster
            img.onload = () => {
                this.images.loaded++;
                console.log(`Near layer ${i} loaded`);
            };
            img.onerror = () => {
                console.error(`Failed to load near-layer-${i}.png`);
            };
            this.nearLayers.push(img);
        }
    }
    
    setupObjects() {
        this.objects = [];
        
        // Middle layer image (hills/village) - reachable in 5 hours
        this.middleLayer = {
            z: this.blueLayerDistance,
            type: 'middle-image'
        };
        
        // Field layers will be added to objects array instead
        
        // Create 20 unique tree layers that will repeat
        for (let layer = 0; layer < 20; layer++) {
            const baseZ = layer * this.redLayerSpacing;
            
            // Use different images for first 8 layers, then repeat
            let imageIndex;
            if (layer < 8) {
                imageIndex = layer; // 0, 1, 2, 3, 4, 5, 6, 7 for first eight layers
            } else {
                imageIndex = (layer - 8) % 8; // Cycle through 0-7 for remaining layers
            }
            
            this.objects.push({
                z: baseZ,
                type: 'near-image',
                layerNumber: layer + 1,
                originalZ: baseZ,
                imageIndex: imageIndex
            });
            
            // Add field layer every 5 tree layers, but closer
            if (layer % 5 === 2) { // Offset by 2 to space them between trees
                this.objects.push({
                    z: baseZ + (this.redLayerSpacing * 1.25), // Reduced by 50% (was 2.5, now 1.25)
                    type: 'field-image',
                    originalZ: baseZ + (this.redLayerSpacing * 1.25)
                });
            }
        }
    }
    
    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'w') this.keys.w = true;
            if (e.key.toLowerCase() === 's') this.keys.s = true;
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key.toLowerCase() === 'w') this.keys.w = false;
            if (e.key.toLowerCase() === 's') this.keys.s = false;
        });
    }
    
    update(deltaTime) {
        if (this.keys.w) {
            // Add 5% random variation to make movement feel more natural
            const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // 0.95 to 1.05
            const adjustedAcceleration = this.acceleration * randomFactor;
            const adjustedMaxSpeed = this.maxSpeed * (0.95 + Math.random() * 0.1); // 95% to 105% of max speed
            this.velocity = Math.min(this.velocity + adjustedAcceleration, adjustedMaxSpeed);
        } else if (this.keys.s) {
            // Add 5% random variation for backward movement too
            const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // 0.95 to 1.05
            const adjustedAcceleration = this.acceleration * randomFactor;
            const adjustedMaxSpeed = this.maxSpeed * (0.95 + Math.random() * 0.1);
            this.velocity = Math.max(this.velocity - adjustedAcceleration, -adjustedMaxSpeed);
        } else {
            this.velocity *= this.friction;
            if (Math.abs(this.velocity) < 0.01) this.velocity = 0;
        }
        
        this.position += this.velocity;
        
        // Hill climbing effect removed
        this.hillOffset = 0;
        
        // Update walking bob effect
        if (Math.abs(this.velocity) > 0.01) {
            // Increase walk cycle based on speed
            this.walkCycle += Math.abs(this.velocity) * 0.3;
            // Calculate bob amount (up and down motion) - subtle effect
            this.bobAmount = Math.sin(this.walkCycle) * 3.5 * Math.abs(this.velocity / this.maxSpeed); // Reduced to 3.5
            // Add slight horizontal sway (half frequency for natural feel) - subtle effect
            this.swayAmount = Math.sin(this.walkCycle * 0.5) * 1.5 * Math.abs(this.velocity / this.maxSpeed); // Reduced to 1.5
        } else {
            // Gradually reduce bob when stopped
            this.bobAmount *= 0.9;
            this.swayAmount *= 0.9;
        }
        
        // Update red layer and field layer positions for looping
        this.objects.forEach(obj => {
            if (obj.type === 'close' || obj.type === 'near-image' || obj.type === 'field-image') {
                // Reset z position based on how far we've traveled
                const cycleLength = 20 * this.redLayerSpacing; // Total length of all 20 layers
                const cyclesTraveled = Math.floor(this.position / cycleLength);
                
                // Position the object in the current or next cycle
                obj.z = obj.originalZ + (cyclesTraveled * cycleLength);
                
                // If object is behind us, move it to the next cycle
                if (obj.z < this.position - this.redLayerSpacing) {
                    obj.z += cycleLength;
                }
            }
        });
    }
    
    render() {
        // Show loading screen if images aren't ready
        if (!this.images || this.images.loaded < this.images.total) {
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '30px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '20px monospace';
            this.ctx.fillText(`${this.images ? this.images.loaded : 0} / ${this.images ? this.images.total : 2} images loaded`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            this.ctx.textAlign = 'left';
            return;
        }
        
        // Draw sky background image if loaded
        if (this.skyImage && this.images.loaded >= 1) {
            // Scale image to fill entire screen
            const scale = Math.max(
                this.canvas.width / this.skyImage.width,
                this.canvas.height / this.skyImage.height
            );
            const width = this.skyImage.width * scale;
            const height = this.skyImage.height * scale;
            const x = (this.canvas.width - width) / 2;
            const y = (this.canvas.height - height) / 2;
            
            this.ctx.drawImage(this.skyImage, x, y, width, height);
        } else {
            // Fallback gradient
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.7, '#98D8E8');
            gradient.addColorStop(1, '#B0E0E6');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // No hill climbing effect
        this.ctx.save();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Draw middle layer image if loaded (no shake)
        if (this.middleImage && this.images.loaded >= 2 && this.middleLayer) {
            const z = this.middleLayer.z - this.position;
            
            if (z > 0) {
                // Calculate how close we are (0 = at the village, 1 = at starting position)
                const distanceRatio = Math.min(1, z / this.blueLayerDistance);
                
                // Scale from 100% width to much larger as we approach
                // At far distance, it's 100% width. At close distance, it's zoomed in
                const minScale = 1.0; // 100% width when far away
                const maxScale = 3.0; // 300% width when close (zoomed in)
                const scale = minScale + (maxScale - minScale) * (1 - distanceRatio);
                
                // Calculate dimensions maintaining aspect ratio
                const width = this.canvas.width * scale;
                const aspectRatio = this.middleImage.width / this.middleImage.height;
                const height = width / aspectRatio;
                
                // Center horizontally, lowered from previous position
                const x = (this.canvas.width - width) / 2;
                const y = this.canvas.height - height - (this.canvas.height * 0.05); // Raised by 20% (was +0.15, now -0.05)
                
                // Always visible, but slightly faded at distance
                this.ctx.globalAlpha = Math.min(1, Math.max(0.6, 1 - distanceRatio * 0.3));
                this.ctx.drawImage(this.middleImage, x, y, width, height);
                this.ctx.globalAlpha = 1;
            }
        }
        
        
        // Sort all objects by depth
        const allObjects = this.objects
            .map(obj => {
                const z = obj.z - this.position;
                if (z <= -100) return null; // Allow objects to pass behind by 100 units
                
                if (obj.type === 'near-image' || obj.type === 'field-image') {
                    // Handle image layers
                    const scale = z > 0 ? 300 / z : 300; // Prevent division issues when very close
                    return {
                        ...obj,
                        z,
                        scale
                    };
                } else {
                    // Handle circle objects
                    const scale = 300 / z;
                    const screenX = centerX + (obj.x * scale);
                    const screenY = centerY + (obj.y * scale);
                    const screenSize = obj.size * scale;
                    
                    return {
                        ...obj,
                        screenX,
                        screenY,
                        screenSize,
                        z,
                        scale
                    };
                }
            })
            .filter(obj => obj && (obj.type === 'near-image' || obj.type === 'field-image' || (obj.screenSize > 0.5 && obj.screenSize < 1000)))
            .sort((a, b) => b.z - a.z);
        
        // Draw all objects
        allObjects.forEach(obj => {
            if (obj.type === 'near-image') {
                // Draw image layers
                const img = this.nearLayers[obj.imageIndex];
                if (img && img.complete) {
                    // Same projection as circles, but draw the image
                    const baseSize = 800; // Base size for the image "object"
                    const size = baseSize * obj.scale;
                    
                    if (size > 10) { // Only check minimum size, no maximum
                        const aspectRatio = img.width / img.height;
                        const width = size;
                        const height = width / aspectRatio;
                        
                        // Center horizontally, position at the lower horizon (where path meets village)
                        // The blue dot appears to be about 30% down from center
                        const horizonY = centerY + (this.canvas.height * 0.3);
                        const x = centerX - width / 2;
                        // Position trees so we're at a medium height - between ground and canopy
                        const y = horizonY - height * 0.7; // Show top 30% above horizon (halfway between 0.5 and 0.9)
                        
                        // Apply distance-based shake effect with steep falloff
                        // Calculate how far this layer is (0 = very close, 1 = at layer 20)
                        const layerDistance = Math.min(1, obj.z / (20 * this.redLayerSpacing));
                        // Use exponential falloff so shake drops off quickly
                        const shakeFactor = Math.pow(1 - layerDistance, 3); // Cubic falloff for steep reduction
                        
                        this.ctx.save();
                        this.ctx.translate(
                            (this.swayAmount || 0) * shakeFactor,
                            (this.bobAmount || 0) * shakeFactor
                        );
                        
                        this.ctx.globalAlpha = 1; // Always fully opaque
                        this.ctx.drawImage(img, x, y, width, height);
                        
                        this.ctx.restore();
                    }
                }
            } else if (obj.type === 'field-image') {
                // Draw field layers
                if (this.fieldImage && this.fieldImage.complete) {
                    // For field layer, we want it to start at 100% screen width
                    const z = obj.z - this.position;
                    if (z > 0) {
                        const scale = 300 / z;
                        
                        // Start at 100% screen width when far away
                        const minWidth = this.canvas.width;
                        const scaleFactor = scale / 300; // Normalize scale
                        const width = minWidth * (1 + scaleFactor * 2); // Scale up from 100% width
                        
                        const aspectRatio = this.fieldImage.width / this.fieldImage.height;
                        const height = width / aspectRatio;
                            
                        // Center horizontally, position from horizon like trees
                        const horizonY = centerY + (this.canvas.height * 0.3);
                        const x = centerX - width / 2;
                        const y = horizonY - height * 0.32; // Lowered by 5% (was 0.37, now 0.32)
                        
                        // No shake effect for field layers
                        this.ctx.globalAlpha = Math.min(1, Math.max(0.5, 300 / z));
                        this.ctx.drawImage(this.fieldImage, x, y, width, height);
                        this.ctx.globalAlpha = 1;
                    }
                }
            } else {
                // Draw circle objects
                this.ctx.globalAlpha = Math.min(1, Math.max(0.3, 300 / obj.z));
                this.ctx.fillStyle = obj.color;
                
                this.ctx.beginPath();
                this.ctx.arc(obj.screenX, obj.screenY, obj.screenSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw numbers on red dots
                if (obj.type === 'close' && obj.screenSize > 10) {
                    this.ctx.globalAlpha = 1;
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = `${Math.max(12, obj.screenSize * 0.4)}px bold monospace`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(obj.layerNumber, obj.screenX, obj.screenY);
                }
            }
        });
        
        this.ctx.globalAlpha = 1;
        
        // Restore canvas state (end hill climbing effect)
        this.ctx.restore();
        
        // Beautiful message
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Georgia, serif';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fillText('press w to walk home.', this.canvas.width / 2, this.canvas.height - 40);
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.textAlign = 'left';
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }
}

new Game();