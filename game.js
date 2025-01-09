/* - Version 2.0 - 2-Feb-2019
 * Game.js
 * Adapted from http://jlongster.com/Making-Sprite-based-Games-with-Canvas
 */

var gameCanvas = new myCanvas('game_canvas');
var lastTime = 0;
var gameSpeed = 5;
var playerWalkSpeed = 1;
var playerRunSpeed = 100;
var center = { x: gameCanvas.width / 2, y: gameCanvas.height / 2 };
var playerpoint = 1;
var last_slime_hit = [];
var level = [];
var savelives = 3;
var timerset = 0;
var doorOpen = 1;
var slimeSound = 0;
var slimeda = 0;
var fdoor = 0;

resources.load([
    'images/rock.png',
    'images/room.png',
    'images/torch_man.png',
    'images/slime.png',
    'images/torch_man_back.png',
    'images/torch_man_right.png',
    'images/torch_man_left.png',
    'images/slime_death.png',
    'images/sword.png',
    'images/black.png',
    'images/slime_damage.png',
    'images/character_damage.png',
    'images/cutscene.png',
    'images/door.png'
]);
document.getElementById('start').addEventListener('click', init);
document.getElementById('start').addEventListener('click', deletemodal);

function deletemodal() {
    playSound('title');
    document.getElementById('startModal').innerHTML = '';
    document.getElementById('startModal').style.backgroundColor = '';
}


var player = {
    speed: 1,
    fireRate: 1,
    pos: { x: 512, y: 600 },
    sprite: new Sprite('images/torch_man.png', [0, 0], [42, 64],
        15, [0, 1, 2, 3, 4, 5, 6, 7], 'horizontal', false, 0, [1, 1], 1),
};
timerset = Date.now();
var cutscene = {
    timer: timerset,
    activate: 1,
    speed: 0,
    pos: { x: 0, y: 0 },
    sprite: new Sprite('images/cutscene.png', [0, 0], [1024, 768],
        0.25, [0, 1, 2, 3, 4], 'horizontal', true, 0, [1, 1], 0)
}
var door = {
    pos: { x: 512, y: 20 },
    sprite: new Sprite('images/door.png', [0,
        0
    ], [64, 80], 1, [0], 'horizontal', false, 0, [1, 1], 0)
}
var end = {
    pos: { x: 0, y: 0 },
    sprite: new Sprite('images/black.png', [0, 0], [1024, 768],
        15, [0], 'horizontal', false, 0, [1, 1], 0)
};
if (end.sprite.opacity != 0.33 || end.sprite.opacity != 0.66) {
    end.sprite.opacity = 0;
}
var background = {
    speed: 0,
    pos: { x: 0, y: 0 },
    sprite: new Sprite('images/room.png', [0, 0], [1024, 768]),
};


var sword = [];
var enemies = [];
var explosions = [];
var death = [];
var slime_damage = [];
var rock = [];
var character_damage = [];
var dir = [];
var rock_coords = [];
var rock_dir = [];
var slime_coords = [];
var door_coords = [];
var size_modifier = [1, 1];
var slime_health = 3;
var endmusic = 1;

function level1() {
    slime_health = 3;
    size_modifier = [1, 1];
    slime_coords = [150, 200, 300, 350, 700, 450];
}

function level2() {
    stopSound('F_M');
    playSound('P_M');
    rock_coords = [89, 350, 186, 350, 283, 350, 380, 350, 477, 350, 574, 350, 671, 350, 768, 350, 865, 350];
    dir = [2, 1, 3, 3, 2, 3, 0, 1, 0];
    slime_coords = [];
}

function level3() {
    stopSound('P_M');
    playSound('F_M');
    dir = [];
    rock_coords = [];
    slime_coords = [512, 200];
    size_modifier = [2, 2];
    slime_health = 8;
}

function level4() {
    stopSound('F_M');
    playSound('P_M');
    rock_coords = [89, 212, 283, 212, 477, 212, 671, 212, 865, 212,
        186, 309, 380, 309, 574, 309, 768, 309,
        89, 406, 283, 406, 477, 406, 671, 406, 865, 406,
        186, 503, 380, 503, 574, 503, 768, 503,
    ];
    dir = [0, 2, 0, 2, 2, 3, 3, 3, 2, 1, 0, 0, 1, 3, 0, 0, 1, 0];
    slime_coords = [];
}

function reload() {
    door = {
        pos: { x: 512, y: 20 },
        sprite: new Sprite('images/door.png', [0,
            0
        ], [64, 80], 1, [0], 'horizontal', false, 0, [1, 1], 0)
    }
    enemies = [];
    rock = [];
    player = {
        speed: 2,
        fireRate: 1,
        pos: { x: 512, y: 600 },
        sprite: new Sprite('images/torch_man.png', [0, 0], [42, 64],
            15, [0, 1, 2, 3, 4, 5, 6, 7], 'horizontal', false, 0, [1, 1], 1),
    };
    for (var i = 0; i < dir.length; i++) {
        rock.push({
            Push_time: 0,
            rock_dir: dir[i],
            pos: { x: rock_coords[i * 2], y: rock_coords[i * 2 + 1] },
            speed: 20,
            dir: 0,
            health: 5,
            sprite: new Sprite("images/rock.png", [0, 0], [95, 95],
                1, [dir[i]])
        });
    }
    for (var i = 0; i < slime_coords.length / 2; i++) {
        enemies.push({
            time_sincejump: 0,
            knockback: 0,
            lasthit: 0,
            pos: { x: slime_coords[i * 2], y: slime_coords[i * 2 + 1] },
            speed: 20,
            dir: 0,
            health: slime_health,
            sprite: new Sprite("images/slime.png", [0, 0], [64, 64],
                5, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 'horizontal', false, 0, size_modifier, 1, )
        });
    }
}
var touching = true;

var gameOver = false;


var score = 0;
var lives = 3;
var last_time_hit = 0;


function init() {

    reset();

    lastTime = Date.now();

    gameLoop();
}

function reset() {
    gameOver = false;
    lives = 3;
    score = 0;
    sword_x = 0;
    sword_y = 0;

};


function gameLoop() {

    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    if (dt > 0.15) {
        dt = 0.15;
    }
    update(dt);

    render();

    lastTime = now;
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
};

function update(dt) {
    handleInput(dt);
    player.sprite.update(dt);
    cutscene.sprite.update(dt);
    background.sprite.update(dt);
    door.sprite.update(dt);
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].sprite.update(dt);
    }
    for (var i = 0; i < rock.length; i++) {
        rock[i].sprite.update(dt);
    }
    for (var i = 0; i < slime_damage.length; i++) {
        slime_damage[i].sprite.update(dt);
    }
    for (var i = 0; i < character_damage.length; i++) {
        character_damage[i].sprite.update(dt);
    }
    for (var i = 0; i < death.length; i++) {
        death[i].sprite.update(dt);
    }
    for (var i = 0; i < sword.length; i++) {
        sword[i].sprite.update(dt);
    }
    if (cutscene.timer + 22000 < Date.now() && cutscene.activate == 1) {
        stopSound('title');
        cutscene.activate = 0;
        playSound('F_M');
    }
    if (player.pos.y < 89) {
        player.pos.y = 89;
    } else if (player.pos.y + getScaledSize(player).h > 670) {
        player.pos.y = 670 - getScaledSize(player).h;
    }
    if (player.pos.x < 89) {
        player.pos.x = 89;
    } else if (player.pos.x + getScaledSize(player).w > 968) {
        player.pos.x = 968 - getScaledSize(player).w;
    }
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].dir = Math.atan2((player.pos.y - enemies[i].pos.y), (player.pos.x - enemies[i].pos.x));
    }
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].pos.x += enemies[i].speed * dt * Math.cos(enemies[i].dir);
        enemies[i].pos.y += enemies[i].speed * dt * Math.sin(enemies[i].dir);
    }
    for (var i = 0; i < sword.length; i++) {
        sword[i].pos.x += sword[i].speed * dt * Math.cos(sword[i].dir);
        sword[i].pos.y += sword[i].speed * dt * Math.sin(sword[i].dir);
    }

    fdoor++
    if (enemies == "" && doorOpen == 1) {
        door.sprite.frames = [1];
        doorOpen = 0;
        if (fdoor > 20) {
            playSound('door');
        }
    }
    if (objectCollides(player, door)) {
        if (enemies == "") {

            playSound('clear');
            doorOpen = 1;
            door.sprite.frames = 1;
            if (level == 5 && endmusic == 1) {
                endmusic = 0;
                level = 6;
                stopSound('P_M');
                playSound('outro');
                reload()
                cutscene = {
                    speed: 0,
                    pos: { x: 0, y: 0 },
                    sprite: new Sprite('images/cutscene.png', [0, 0], [1024, 768],
                        1, [5], 'horizontal', false, 0, [1, 1], 1)
                }
            } else
            if (level == 4) {
                level = 5;
                level4();
                savelives = lives;
                reload();
            } else
            if (level == 2) {
                level = 3;
                level2();
                savelives = lives;
                reload();
            } else
            if (level == 3) {
                level = 4;
                level3();
                savelives = lives;
                reload();
            } else
            if (level != 6) {
                level = 2;
                level1();
                savelives = lives;
                reload();
            }
        }
    }
    for (var i = 0; i < enemies.length; i++) {
        for (var j = 0; j < enemies.length; j++) {
            if (i == j) {
                continue;
            } else if (objectCollides(enemies[i], enemies[j])) {
                if (enemies[i].pos.x < enemies[j].pos.x) {
                    enemies[i].pos.x -= 1;
                } else {
                    enemies[j].pos.x -= 1;
                }
                if (enemies[i].pos.y < enemies[j].pos.y) {
                    enemies[i].pos.y -= 1;
                } else {
                    enemies[j].pos.y -= 1;
                }
            }
        }
    }
    for (var i = 0; i < enemies.length; i++) {
        if (Date.now() - enemies[i].knockback > 500) {
            enemies[i].speed = 20;
        }
        if (Date.now() - enemies[i].time_sincejump > 2400) {
            enemies[i].time_sincejump = Date.now();
        } else if (Date.now() - enemies[i].time_sincejump > 2000 && enemies[i].speed != -100) {
            enemies[i].speed = 20;
        } else if (Date.now() - enemies[i].time_sincejump > 1200 && enemies[i].speed != -100) {
            if (Date.now() - slimeSound > 300) {
                playSound('slime_j')
                slimeSound = Date.now()
            }
            enemies[i].speed = 100;
            if (level == 4) {
                enemies[i].speed = 300;
            }
        }
    }
    for (var i = 0; i < sword.length; i++) {

        if (Date.now() - sword[i].time > 250) {
            sword.splice(i, 1);
            i--;
        }

        for (var j = 0; j < enemies.length; j++) {
            if (objectCollides(sword[i], enemies[j]) && Date.now() - enemies[j].lasthit > 1000) {
                i--;
                enemies[j].health--;
                var xPos = enemies[j].pos.x;
                var yPos = enemies[j].pos.y;
                if (Date.now() - slimeda > 300) {
                    playSound('slime_h')
                    slimeda = Date.now()
                }
                slime_damage.push({
                    pos: { x: xPos, y: yPos },
                    sprite: new Sprite("images/slime_damage.png", [0, 0], [80, 80],
                        20, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'horizontal', true, 0, [1, 1], 1, )
                });
                enemies[j].lasthit = Date.now()
                enemies[j].knockback = Date.now()
                enemies[j].speed = -100;
                if (enemies[j].health == 0) {
                    var xPos = enemies[j].pos.x;
                    var yPos = enemies[j].pos.y;
                    if (level == 4) {
                        death.push({
                            pos: { x: xPos, y: yPos },
                            sprite: new Sprite("images/slime_death.png", [0, 0], [64, 64],
                                8, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 'horizontal', true, 0, [2, 2], 1, )
                        });
                    } else {
                        death.push({
                            pos: { x: xPos, y: yPos },
                            sprite: new Sprite("images/slime_death.png", [0, 0], [64, 64],
                                8, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 'horizontal', true, 0, [1, 1], 1, )
                        });
                    }
                    enemies.splice(j, 1);
                    j--;

                }
                break;
            }
            if (i < 0) break;
        }
        if (i < 0) break;

        sword[i].pos.x += sword[i].speed * dt * Math.cos(sword[i].dir);
        sword[i].pos.y += sword[i].speed * dt * Math.sin(sword[i].dir);
    }
    for (var j = 0; j < enemies.length; j++) {
        if (objectCollides(player, enemies[j]) && Date.now() - last_time_hit > 2000) {

            loseLife();
            playSound('hurt');
            last_time_hit = Date.now();
            break;
        }
        if (i < 0) break;
    }


}

function render() {

    gameCanvas.clear();


    renderEntity(background);
    renderEntity(player);
    renderEntities(enemies);
    renderEntities(slime_damage);
    renderEntities(character_damage);
    renderEntities(death);
    renderEntities(rock);
    renderEntities(sword);
    renderEntity(door);
    renderEntity(end);
    renderEntity(cutscene);

}


var curKey = null;
var moveSize = 0.30;
var lastFire = 0;

function handleInput(dt) {

    if (input.isDown('r')) {
        if (lives < 0 && lives == 0) {
            stopSound('P_M');
            stopSound('F_M');
            savelives = 3;
            level = 0;
            end.sprite.opacity = 0;
            rock_coords = [];
            rock_dir = [];
            slime_coords = [];
            enemies = [];
            playSound('P_M');
        }
        lives = savelives;
        reload()
        if (savelives == 3) {
            end.sprite.opacity = 0;
        }
        if (savelives == 2) {
            end.sprite.opacity = 0.33;
        }
        if (savelives == 1) {
            end.sprite.opacity = 0.66;
        }

        curKey = 'r';
    }
    var moving = true;
    if (input.isDown('k') &&
        Date.now() - lastFire > (1000 / player.fireRate)) {
        if (playerpoint == 0) {
            sword_y = -45;
            sword_x = -20;
        } else if (playerpoint == 1) {
            sword_y = 50;
            sword_x = 0;
        } else if (playerpoint == 1.5) {
            sword_x = -52;
            sword_y = 10;
        } else if (playerpoint == 0.5) {
            sword_x = 20;
            sword_y = 0;
        }
        playSound('sword');
        sword.push({
            pos: {
                x: parseInt(player.pos.x) + parseInt(sword_x),
                y: parseInt(player.pos.y) + parseInt(sword_y)
            },
            speed: 0,
            time: Date.now(),
            dir: playerpoint * Math.PI - Math.PI / 2,
            sprite: new Sprite('images/sword.png', [0, 0], [72, 56],

                32, [0, 1, 2, 3, 4, 5, 6, 7, 8], 'horizontal', true, playerpoint * Math.PI, [1, 1], 1)

        })
        lastFire = Date.now();
    } else
    if (input.isDown('s')) {
        if (player.sprite.url != 'images/torch_man.png') {
            player.sprite = new Sprite('images/torch_man.png', [0, 0], [42, 64],
                15, [0, 1, 2, 3, 4, 5, 6, 7], 'horizontal', false, 0, [1, 1], 1)
        }
        player.pos.y += player.speed;
        for (var i = 0; i < rock.length; i++) {
            if (objectCollides(player, rock[i])) {
                player.pos.y -= player.speed;
                if (rock[i].Push_time == 0 && rock[i].rock_dir == 2) {
                    rock[i].pos.y = rock[i].pos.y + 96;
                    rock[i].Push_time = 1;
                    for (var j = 0; j < rock.length; j++) {
                        if (objectCollides(rock[i], rock[j]) && rock[i] != rock[j]) {
                            rock[i].pos.y = rock[i].pos.y - 96;
                            rock[i].Push_time = 0;
                        }
                    }
                    if (rock[i].Push_time == 1) {
                        playSound('rock')
                    }
                }
            }
        }
        playerpoint = 1

        curKey = 's';
    } else
    if (input.isDown('w')) {
        if (player.sprite.url != 'images/torch_man_back.png') {
            player.sprite = new Sprite('images/torch_man_back.png', [0, 0], [42, 64],
                15, [0, 1, 2, 3, 4, 5, 6, 7], 'horizontal', false, 0, [1, 1], 1)
        }

        player.pos.y -= player.speed;
        for (var i = 0; i < rock.length; i++) {
            if (objectCollides(player, rock[i])) {
                player.pos.y += player.speed;
                if (rock[i].Push_time == 0 && rock[i].rock_dir == 0) {
                    rock[i].pos.y = rock[i].pos.y - 96;
                    rock[i].Push_time = 1;
                    for (var j = 0; j < rock.length; j++) {
                        if (objectCollides(rock[i], rock[j]) && rock[i] != rock[j]) {
                            rock[i].pos.y = rock[i].pos.y + 96;
                            rock[i].Push_time = 0;
                        }
                    }
                    if (rock[i].Push_time == 1) {
                        playSound('rock')
                    }
                }
            }
        }
        playerpoint = 0
        curKey = 'w';
    } else
    if (input.isDown('a')) {
        if (player.sprite.url != 'images/torch_man_left.png') {
            player.sprite = new Sprite('images/torch_man_left.png', [0, 0], [42, 64],
                15, [0, 1, 2, 3, 4, 5, 6, 7], 'horizontal', false, 0, [1, 1], 1)
        }
        player.pos.x -= player.speed;
        for (var i = 0; i < rock.length; i++) {
            if (objectCollides(player, rock[i])) {
                player.pos.x += player.speed;
                if (rock[i].Push_time == 0 && rock[i].rock_dir == 3) {
                    rock[i].pos.x = rock[i].pos.x - 96;
                    rock[i].Push_time = 1;
                    for (var j = 0; j < rock.length; j++) {
                        if (objectCollides(rock[i], rock[j]) && rock[i] != rock[j]) {
                            rock[i].pos.x = rock[i].pos.x + 96;
                            rock[i].Push_time = 0;
                        }
                    }
                    if (rock[i].Push_time == 1) {
                        playSound('rock')
                    }
                }
            }
        }
        playerpoint = 1.5


        curKey = 'a';
    } else
    if (input.isDown('d')) {
        if (player.sprite.url != 'images/torch_man_right.png') {
            player.sprite = new Sprite('images/torch_man_right.png', [0, 0], [42, 64],
                15, [0, 1, 2, 3, 4, 5, 6, 7], 'horizontal', false, 0, [1, 1], 1)
        }
        player.pos.x += player.speed;
        for (var i = 0; i < rock.length; i++) {
            if (objectCollides(player, rock[i])) {
                player.pos.x -= player.speed;
                if (rock[i].Push_time == 0 && rock[i].rock_dir == 1) {
                    rock[i].pos.x = rock[i].pos.x + 96;
                    rock[i].Push_time = 1;
                    for (var j = 0; j < rock.length; j++) {
                        if (objectCollides(rock[i], rock[j]) && rock[i] != rock[j]) {
                            rock[i].pos.x = rock[i].pos.x - 96;
                            rock[i].Push_time = 0;
                        }
                    }
                    if (rock[i].Push_time == 1) {
                        playSound('rock')
                    }
                }
            }
        }
        playerpoint = 0.5;
        curKey = 'd';
    } else {
        moving = false;
    }

    if (moving) {
        if (input.isDown('j')) {

            player.sprite.speed = 30;
            player.speed = playerRunSpeed;


            curKey = 'j';
        } else {
            player.sprite.speed = 10;
            player.speed = playerWalkSpeed;
        }
    } else {
        player.sprite.speed = 0;
    }
}





function loseLife() {

    lives--;
    var xPos = player.pos.x;
    var yPos = player.pos.y;
    character_damage.push({
        pos: { x: xPos, y: yPos },
        sprite: new Sprite("images/character_damage.png", [0, 0], [80, 80],
            20, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'horizontal', true, 0, [1, 1], 1, )
    });
    if (lives == 2) {
        end.sprite.opacity = 0.33;
    }
    if (lives == 1) {
        end.sprite.opacity = 0.66;
    }

    if (lives == 0) {
        end.sprite.opacity = 1;
    }

}