const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 720;
canvas.height = 512;

c.fillStyle = 'black';
c.fillRect(0, 0, canvas.width, canvas.height);

class Paddle {
  constructor( {position, size, constantVelocity, isEnemy = false} ) {
    this.position = position;
    this.size = size;
    // Constant velocity does not change compared to velocity
    this.constantVelocity = constantVelocity;
    this.offset = {
      x: this.size.width / 2,
      y: this.size.height / 2
    };
    this.sides = {
      top: this.position.y - this.offset.y,
      right: this.position.x + this.size.width,
      bottom: this.position.y + this.offset.y,
      left: this.position.x
    };
    this.velocity = 0;
    this.lastKey;
    this.score = 0;
  }

  draw() {
    c.fillStyle = 'white';
    c.fillRect(this.position.x, 
      this.position.y - this.offset.y, 
      this.size.width, 
      this.size.height);
  }

  update () {
    this.draw();

    // Paddle position based on velocity
    this.position.y += this.velocity;

    // Update paddle sides every frame
    this.sides.top = this.position.y - this.offset.y;
    this.sides.right = this.position.x + this.size.width;
    this.sides.bottom = this.position.y + this.offset.y;
    this.sides.left = this.position.x;
  }
}

class Ball {
  constructor ( {position, size, constantVelocity} ) {
    this.position = position;
    this.size = size;
    // Constant velocity does not change compared to velocity
    this.constantVelocity = constantVelocity;
    this.offset = {
      x: this.size.width / 2,
      y: this.size.height / 2
    };
    this.sides = {
      top: this.position.y - this.offset.y,
      right: this.position.x + this.offset.x,
      bottom: this.position.y + this.offset.y,
      left: this.position.x - this.offset.x
    };
    this.velocity = {
      x: 0,
      y: 0
    };
    this.gameStarted = false;
  }

  draw() {
    c.fillStyle = 'white';
    c.fillRect(this.position.x - this.offset.x, 
      this.position.y - this.offset.y, 
      this.size.width, 
      this.size.height);
  }

  update() {
    this.draw();

    // Change position based on velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (!this.gameStarted) this.position.y = player.position.y;

    // Update ball sides every frame
    this.sides.top = this.position.y - this.offset.y;
    this.sides.right = this.position.x + this.offset.x;
    this.sides.bottom = this.position.y + this.offset.y;
    this.sides.left = this.position.x - this.offset.x
  }

  start() {
    if (this.gameStarted === false) {
      this.gameStarted = true;
      // Set it's velocity to initial start values
      this.velocity.x = this.constantVelocity;
      this.velocity.y = player.velocity;
    }
  }

  reset(direction) {
    // Reset ball location to middle but go towards player(-1) or enemy(1)
    ball.position.x = (canvas.width / 2) - ball.offset.x;
    ball.position.y = (canvas.height / 2) - ball.offset.y;
    ball.velocity.x = direction;
    ball.velocity.y = (Math.floor(Math.random() * 4)) * (Math.random() <= 0.5 ? -1 : 1);
  }
}

const keys = {
  w: {
    pressed: false
  },
  s: {
    pressed: false
  }
}

const player = new Paddle({
  position: {
    x: 25,
    y: 256
  },
  size: {
    width: 20,
    height: 100
  },
  constantVelocity: 2
});

const enemy = new Paddle({
  position: {
    x: canvas.width - 45/*Width of enemy + distance from wall*/,
    y: 256
  },
  size: {
    width: 20,
    height: 100
  },
  constantVelocity: 2
})

const ball = new Ball({
  position: {
    x: canvas.width / 2,
    y: canvas.height / 2
  },
  size: {
    width: 10,
    height: 10
  },
  constantVelocity: 3
})

function determineCollision(paddle1, paddle2) {
  if ((ball.sides.right >= paddle2.sides.left &&
    ball.sides.left <= paddle2.sides.right &&
    ball.sides.bottom >= paddle2.sides.bottom &&
    ball.sides.top <= paddle2.sides.bottom) || 
    (ball.sides.left <= paddle1.sides.right &&
    ball.sides.right >= paddle1.sides.left &&
    ball.sides.bottom >= paddle1.sides.bottom &&
    ball.sides.top <= paddle1.sides.bottom)) return 'top';
  else if ((ball.sides.right >= paddle2.sides.left &&
    ball.sides.left <= paddle2.sides.right &&
    ball.sides.bottom >= paddle2.sides.top &&
    ball.sides.top <= paddle2.sides.top) ||
    (ball.sides.left <= paddle1.sides.right &&
    ball.sides.right >= paddle1.sides.left &&
    ball.sides.bottom >= paddle1.sides.top &&
    ball.sides.top <= paddle1.sides.top)) return 'bottom';
  else if (ball.sides.right >= paddle2.sides.left &&
    ball.sides.top <= paddle2.sides.bottom &&
    ball.sides.bottom >= paddle2.sides.top && 
    ball.sides.left <= paddle2.sides.left) return 'right';
  else if (ball.sides.left <= paddle1.sides.right &&
    ball.sides.top <= paddle1.sides.bottom &&
    ball.sides.bottom >= paddle1.sides.top &&
    ball.sides.right >= paddle1.sides.right) return 'left';
  else if (ball.sides.top <= 0 || ball.sides.bottom >= canvas.height) return 'wall';
}

function determineYVelocity(paddle) {
  if (ball.velocity.y > 0 && paddle.velocity < 0) {
    ball.velocity.y = ball.constantVelocity * -1;
  } else if (ball.velocity.y < 0 && paddle.velocity > 0) {
    ball.velocity.y = ball.constantVelocity;
  } else if (ball.velocity.y === 0 && paddle.velocity !== 0) {
    ball.velocity.y = paddle.velocity;
  }
}

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  // Half line
  c.fillStyle = 'grey';
  c.fillRect(canvas.width / 2 - 10, 0, 20, canvas.height);

  ball.update();

  // Player Movement
  if (keys.w.pressed && player.lastKey === 'w') {
    player.velocity = player.constantVelocity * -1;
  } else if (keys.s.pressed && player.lastKey === 's') {
    player.velocity = player.constantVelocity;
  } else {
    player.velocity = 0;
  }

  // Enemy Movement
  if (enemy.position.y < ball.position.y) {
    enemy.velocity = enemy.constantVelocity;
  } else if (enemy.position.y > ball.position.y) {
    enemy.velocity = enemy.constantVelocity * -1;
  }
  else if (enemy.position.y === ball.position.y) {
    enemy.velocity = 0;
  }

  // Top/Bottom Paddle Collision
  if (player.sides.top <= 0) {
    player.position.y = 0 + player.offset.y;
  }else if (player.sides.bottom >= canvas.height) {
    player.position.y = canvas.height - player.offset.y;
  } else if (enemy.sides.top <= 0) {
    enemy.position.y = 0 + enemy.offset.y;
  }else if (enemy.sides.bottom >= canvas.height) {
    enemy.position.y = canvas.height - enemy.offset.y;
  } 

  const collided = determineCollision(player, enemy);
  switch (collided) {
    case 'top':
      ball.velocity.y = ball.constantVelocity;
      break;
    case 'right':
      ball.velocity.x = ball.constantVelocity * -1;
      determineYVelocity(enemy);
      break;
    case 'bottom':
      ball.velocity.y = ball.constantVelocity * -1;
      break;
    case 'left':
      ball.velocity.x = ball.constantVelocity;
      determineYVelocity(player);
      break;
    case 'wall':
      ball.velocity.y = ball.velocity.y * -1;
  }

  // Check for win
  if (ball.sides.right <= 0) {
    enemy.score++;
    document.querySelector('#score-enemy').innerText = enemy.score;
    // Velocity goes in negative direction (towards player)
    ball.reset(-1);
  } 
  else if (ball.sides.left >= canvas.width) {
    player.score++;
    document.querySelector('#score-player').innerText = player.score;
    // Velocity goes in positive direction (towards enemy)
    ball.reset(1);
  }
}

animate();

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = true;
      player.lastKey = 'w';
      break;
    case 's':
      keys.s.pressed = true;
      player.lastKey = 's';
      break;
    case ' ':
      ball.start();
      break;
  }
})

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = false;
      break;
    case 's':
      keys.s.pressed = false;
      break;
  }
})