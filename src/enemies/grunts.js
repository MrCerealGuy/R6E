import Phaser from 'phaser';
import {DEBUG, SCALE} from '../utils/globals';

var grunt_anims = {
    idle: {
        startFrame: 0,
        endFrame: 1,
        speed: 0.2
    },
    walk: {
        startFrame: 0,
        endFrame: 1,
        speed: 0.15
    }
};

var grunt_directions = {
    west: { offset: 0, x: -2, y: 0, opposite: 'east' },
    northWest: { offset: 0, x: -2, y: -1, opposite: 'southEast' },
    north: { offset: 0, x: 0, y: -2, opposite: 'south' },
    northEast: { offset: 0, x: 2, y: -1, opposite: 'southWest' },
    east: { offset: 0, x: 2, y: 0, opposite: 'west' },
    southEast: { offset: 0, x: 2, y: 1, opposite: 'northWest' },
    south: { offset: 0, x: 0, y: 2, opposite: 'north' },
    southWest: { offset: 0, x: -2, y: 1, opposite: 'northEast' }
};

export default class Grunt extends Phaser.GameObjects.Image
{
    constructor(scene, x, y, motion, direction, distance)
    {
        super(scene, x, y, 'grunt')//, direction.offset);

        this.scene = scene;

        this.startX = x;
        this.startY = y;
        this.distance = distance;

        this.motion = motion;
        this.anim = grunt_anims[motion];
        this.direction = grunt_directions[direction];
        this.speed = 0.15;
        this.f = this.anim.startFrame;

        this.depth = y + 64;

        this.setScale(SCALE);

        scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    }

    changeFrame ()
    {
        this.f++;

        var delay = this.anim.speed;

        if (this.f === this.anim.endFrame)
        {
            switch (this.motion)
            {
                case 'walk':
                    this.f = this.anim.startFrame;
                    this.frame = this.texture.get(/*this.direction.offset + */this.f);
                    this.scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
                    break;

                case 'idle':
                    delay = 0.5 + Math.random();
                    this.scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;
            }
        }
        else
        {
            this.frame = this.texture.get(/*this.direction.offset + */this.f);

            this.scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
        }
    }

    resetAnimation ()
    {
        this.f = this.anim.startFrame;

        this.frame = this.texture.get(/*this.direction.offset + */this.f);

        this.scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    }

    update ()
    {
        if (this.motion === 'walk')
        {
            this.x += this.direction.x * this.speed;

            if (this.direction.y !== 0)
            {
                this.y += this.direction.y * this.speed;
                this.depth = this.y + 64;
            }

            //  Walked far enough?
            if (Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y) >= this.distance)
            {
                this.direction = grunt_directions[this.direction.opposite];
                this.f = this.anim.startFrame;
                this.frame = this.texture.get(/*this.direction.offset + */this.f);
                this.startX = this.x;
                this.startY = this.y;
            }
        }
    }
}