class Mouse3D {
    constructor() {
        this.mouse = {x: 0, y: 0};
        this.dragStartMousePosition = null;
        this.dragStartPhiTheta = null;
        this.theta = 0;
        this.phi = 0;
        this.eye = [0, 0, 0];
        addEventListener('mousemove', e => this.mouseMove(e));
        addEventListener('mouseup',  e => this.mouseUp(e));
        addEventListener('mousedown',  e => this.mouseDown(e));
    }

    mouseMove(event) {
        this.mouse = event;
        this.dragStartMousePosition && this.rotate();
    }

    rotate() {
        let amountX = this.dragStartMousePosition ? this.dragStartMousePosition.x - this.mouse.x : 0;
        let amountZ = this.mouse.y - this.dragStartMousePosition.y;
        this.theta = this.dragStartPhiTheta[1] + amountX/360;
        this.phi = this.dragStartPhiTheta[0] + amountZ/360;
        let limit = Math.PI / 2;
        this.phi = this.phi > limit ? limit : this.phi;
        this.phi = this.phi < -limit ? -limit : this.phi;
        this.update();
    }

    mouseDown(event) {
        this.dragStartPhiTheta = [this.phi, this.theta];
        this.dragStartMousePosition = event;
    }

    mouseUp() {
        this.dragStartMousePosition = null;
        this.dragStartPhiTheta = null;
    }

    update(){}
}

class OrbitControls extends Mouse3D {

    constructor(radius, lookAt) {
        super();
        this.radius = radius || 3;
        this.lookAt = lookAt || [0,0,0]
        addEventListener('mousewheel', e => this.mouseWheel(e));
        this.update();
    }

    update() {
        let m = this;
        m.eye[0] = m.lookAt[0] + m.radius * Math.cos(m.phi) * Math.sin(m.theta);
        m.eye[1] = m.lookAt[1] + m.radius * Math.sin(m.phi);
        m.eye[2] = m.lookAt[2] + m.radius * Math.cos(m.phi) * Math.cos(m.theta);
    }

     mouseWheel(e){
        this.radius *= e.wheelDelta > 0 ? 0.9 : 1.1;
        this.update();
        e.preventDefault()
    }
}

class FirstPersonControls extends Mouse3D {
    constructor() {
        super();
        this.maxSpeed = 100;
        this.speed = this.directions();
        this.moveDir = this.directions();
        this.forward = [0, 0, 1];
        this.right = [1, 0, 0];
        addEventListener('keydown', this.keyListener(true), false);
        addEventListener('keyup', this.keyListener(false), false);
        setInterval(() => this.updatePositions(), 10);
    }

    directions() {
        return {
            forward: 0,
            backward: 0,
            right: 0,
            left: 0,
        }
    }

    magnitude(p1, p2) {
        var dx = p1[0] - p2[0];
        var dy = p1[1] - p2[1];
        var dz = p1[2] - p2[2];
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }

    upd(delta, dir, mag, i) {
        var k = 0.01;
        delta = dir * k * mag * delta;
        this.eye[i] += delta;
        this.forward[i] += delta;
        this.right[i] += delta;
    }

    update(){
        let m = this;
        m.forward[0] = m.eye[0] + Math.cos(m.phi) * Math.sin(m.theta);
        m.forward[1] = m.eye[1] - Math.sin(m.phi);
        m.forward[2] = m.eye[2] + Math.cos(m.phi) * Math.cos(m.theta);
        m.right[0] = m.eye[0] + Math.sin(m.theta + Math.PI/2);
        m.right[1] = m.eye[1];
        m.right[2] = m.eye[2] + Math.cos(m.theta + Math.PI/2);
    }

    updatePositions() {
        let speed = this.speed;
        Object.keys(speed).forEach(s => this.updateSpeed(s));
        var magForward = this.magnitude(this.forward, this.eye);
        var magRight = this.magnitude(this.right, this.eye);
        for (var i = 0; i < 3; i++) {
            let deltaForward = this.forward[i] - this.eye[i]
            this.upd(deltaForward, speed.forward, magForward, i);
            this.upd(deltaForward, speed.backward, -magForward, i);
            let deltaRight = this.right[i] - this.eye[i];
            this.upd(deltaRight, speed.right, -magRight, i);
            this.upd(deltaRight, speed.left, magRight, i);
        }
    }


    updateSpeed(key) {
        let speed = this.speed;
        if (this.moveDir[key]) {
            speed[key] += 0.02;
        } else {
            speed[key] /= 2;
        }
        if (speed[key] < 0.01) {
            speed[key] = 0;
        }
        speed[key] = Math.min(speed[key], this.maxSpeed);
    }

    keyListener(state) {
        return e => {
            if (e.key === "w") this.moveDir.forward = state;
            if (e.key === "s") this.moveDir.backward = state;
            if (e.key === "a") this.moveDir.left = state;
            if (e.key === "d") this.moveDir.right = state;
        }
    }
}