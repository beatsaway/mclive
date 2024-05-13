
        function createTextTexture(letter, color) {
            const canvas = document.createElement('canvas');
            const size = 256;
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext('2d');

            context.fillStyle = color;
            context.fillRect(0, 0, size, size);
            context.font = 'Bold 150px Cambria';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = 'white';
            context.fillText(letter, size / 2, size / 2);

            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            return texture;
        }

        class Meadow {
            constructor(name, color, letter) {
                this.name = name;
                this.color = color;
                this.mesh = this.createMeadow(letter);
            }

            createMeadow(letter) {
                const geometry = new THREE.BoxGeometry(40, 40, 40); // Cube instead of plane
                const material = new THREE.MeshLambertMaterial({
                    map: createTextTexture(letter, this.color)
                });
                const meadow = new THREE.Mesh(geometry, material);
                meadow.receiveShadow = true;
                return meadow;
            }

            getObject() {
                return this.mesh;
            }
        }

        class SceneSetup {
            constructor() {
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.renderer = new THREE.WebGLRenderer({ antialias: true });
                this.renderer.setClearColor(0x87ceeb);
                this.renderer.setSize(window.innerWidth*0.99, window.innerHeight*0.99);
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                document.body.appendChild(this.renderer.domElement);

                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.1;
                this.controls.screenSpacePanning = true;
                this.controls.rotateSpeed = 0.7;

                this.camera.position.set(0, 50, 30);
                this.camera.lookAt(new THREE.Vector3(0, 0, 0));

                this.addLights();
                this.addMeadows();
                this.addHumanoid();
                this.animate();
            }

            addLights() {
                const ambientLight = new THREE.AmbientLight(0xf0f0c0);
                this.scene.add(ambientLight);
                const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                directionalLight.position.set(0, 100, 50);
                directionalLight.castShadow = true;
                this.scene.add(directionalLight);
            }

            addMeadows() {
                const meadowColors = ['#32FD32', '#3BAF3B', '#46C946', '#51E351'];
                const letters = ['A', 'B', 'C', 'D'];
                const meadows = meadowColors.map((color, index) => 
                    new Meadow(`Meadow${index + 1}`, color, letters[index]).getObject());

                meadows.forEach((meadow, index) => {
                    meadow.position.set((index - 1.5) * 41, -22, 0);
                    this.scene.add(meadow);
                });
            }
            addHumanoid() {
                const name = "001";
                const headColor = 0xffcc00; // Yellow head
                const bodyColor = 0x336699; // Blue body
                const feetColor = 0xcc3333; // Red feet
                this.humanoid = new Humanoid(name, headColor, bodyColor, feetColor);

                const humanoidObj = this.humanoid.getObject();
                humanoidObj.position.set(0, 0, 0); // Adjusted the position to sit on a meadow
                this.scene.add(humanoidObj);
            }

            animate() {
                requestAnimationFrame(() => this.animate());
                this.controls.update();
                this.humanoid.animate();
                this.renderer.render(this.scene, this.camera);
            }
        }

        class Humanoid {
            constructor(name, headColor, bodyColor, feetColor) {
                this.name = name;
                this.headColor = headColor;
                this.bodyColor = bodyColor;
                this.feetColor = feetColor;

                this.oscMove = [
                    Math.random() * 0.005, // Head movement speed
                    Math.random() * 0.002, // Left hand movement speed
                    Math.random() * 0.002, // Right hand movement speed
                    Math.random() * 0.008  // Feet rotation speed
                ];

                this.headDirection = this.oscMove[0];
                this.handLDirection = this.oscMove[1];
                this.handRDirection = this.oscMove[2];
                this.feetDirection = this.oscMove[3];

                this.group = new THREE.Group();
                this.head = null;
                this.handL = null;
                this.handR = null;
                this.feet = null;

                this.addHead();
                this.addBody();
                this.addFeet();
                this.addHandL();
                this.addHandR();
            }

            addHead() {
                const geometry = new THREE.BoxGeometry(1.8, 2, 1.8);
                const material = new THREE.MeshLambertMaterial({ color: this.headColor });
                this.head = new THREE.Mesh(geometry, material);
                this.head.position.set(0, 4, 0);
                this.head.castShadow = true;
                this.group.add(this.head);
            }

            addBody() {
                const geometry = new THREE.BoxGeometry(2, 3, 1.5);
                const material = new THREE.MeshLambertMaterial({ color: this.bodyColor });
                const body = new THREE.Mesh(geometry, material);
                body.position.set(0, 1.5, 0);
                body.castShadow = true;
                this.group.add(body);
            }

            addFeet() {
                const geometry = new THREE.BoxGeometry(1.8, 2, 1);
                const material = new THREE.MeshLambertMaterial({ color: this.feetColor });
                this.feet = new THREE.Mesh(geometry, material);
                this.feet.position.set(0, -1, 0);
                this.feet.castShadow = true;
                this.group.add(this.feet);
            }

            addHandL() {
                const geometry = new THREE.BoxGeometry(1, 1, 1.5);
                const material = new THREE.MeshLambertMaterial({ color: this.bodyColor });
                this.handL = new THREE.Mesh(geometry, material);
                this.handL.position.set(-1.2, 2, 0.8);
                this.handL.rotation.x = Math.PI / 4;
                this.handL.castShadow = true;
                this.group.add(this.handL);
            }

            addHandR() {
                const geometry = new THREE.BoxGeometry(1, 1, 1.5);
                const material = new THREE.MeshLambertMaterial({ color: this.bodyColor });
                this.handR = new THREE.Mesh(geometry, material);
                this.handR.position.set(1.2, 2, 0.8);
                this.handR.rotation.x = Math.PI / 4;
                this.handR.castShadow = true;
                this.group.add(this.handR);
            }

            getObject() {
                return this.group;
            }

            animate() {
                // Oscillating head movement
                this.head.rotation.y += this.headDirection;
                if (this.head.rotation.y > 0.2 || this.head.rotation.y < -0.2) {
                    this.headDirection *= -1;
                }

                // Oscillating left hand movement
                this.handL.rotation.x += this.handLDirection;
                if (this.handL.rotation.x > Math.PI / 2 || this.handL.rotation.x < Math.PI / 8) {
                    this.handLDirection *= -1;
                }

                // Oscillating right hand movement
                this.handR.rotation.x += this.handRDirection;
                if (this.handR.rotation.x > Math.PI / 2 || this.handR.rotation.x < Math.PI / 8) {
                    this.handRDirection *= -1;
                }

                // Oscillating feet movement on the y-axis
                this.feet.rotation.y += this.feetDirection;
                if (this.feet.rotation.y > 0.2 || this.feet.rotation.y < -0.2) {
                    this.feetDirection *= -1;
                }
            }
        }

        const sceneSetup = new SceneSetup();



