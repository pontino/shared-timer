const moment = require('moment');
const express = require('express');
const http = require('http');
const cors = require('cors');
const compression = require('compression');

const _app_folder = __dirname + '/public/';

const EMIT_CYCLE = 20;
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:4200';

let cycle = 0;
const offlineDb = [
    {
        room: 'Anzio Ovest',
        manager: 'anzio123',
        viewer: 'anzio',
        status: 'pause',
        seconds: 0,
        latestTargetTime: null,
        lastManager: null
    },
    {
        room: 'Roma Tiburtina',
        manager: 'tiburtina652',
        viewer: 'tiburtina',
        status: 'pause',
        seconds: 0,
        latestTargetTime: null,
        lastManager: null
    },
    {
        room: 'Roma Tagalog Tiburtina',
        manager: 'RTTtimer',
        viewer: 'tagalog',
        status: 'pause',
        seconds: 0,
        latestTargetTime: null,
        lastManager: null
    },
    {
        room: 'Tivoli Terme',
        manager: 'tivoli144',
        viewer: 'tivoli-terme',
        status: 'pause',
        seconds: 0,
        latestTargetTime: null,
        lastManager: null
    }
];

const app = express();
const httpServer = http.createServer(app);
// noinspection JSValidateTypes
const io = require('socket.io')(httpServer, {
    cors: {
        origin: allowedOrigin,
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

app.use(cors());
app.use(compression());

app.get('/api/status', (req, res) => {
    res.json({ status: 'running' });
});

app.get('/api/timers', (req, res) => {
    res.json({
        timers: offlineDb.map(row => {
            const { room, viewer, status, seconds } = row;
            return { room, viewer, status, seconds };
        })
    });
});


app.get('/api/timer/:viewer', (req, res) => {
    const viewer = req.params.viewer;
    let timer = null;
    for (let i = 0; i < offlineDb.length; i++) {
        const currentRow = offlineDb[i];
        if (currentRow.viewer === viewer) {
            const { room, viewer, status, seconds } = currentRow;
            timer = { room, viewer, status, seconds };
            break;
        }
    }
    res.json({ timer });
});

app.get('*.*', express.static(_app_folder, { maxAge: '1d' }));

app.all('*', (req, res) => {
    res.status(200).sendFile('/', { root: _app_folder });
});

io.on('connection', (socket) => {
    socket.on('password', (password) => {
        // console.log('Password=' + password + '; ClientId=' + socket.id);
        let roomFound = false;
        for (let i = 0; i < offlineDb.length; i++) {
            const currentRow = offlineDb[i];
            if (currentRow.manager === password || currentRow.viewer === password) {
                socket.join(currentRow.room);
                const level = currentRow.manager === password ? 'manager' : 'viewer';
                const room = currentRow.room;
                const status = currentRow.status;
                const seconds = currentRow.seconds;

                if (level === 'manager') {
                    if (currentRow.lastManager) {
                        // console.log('DOWNGRADE OTHER MANAGER');
                        io.to(currentRow.lastManager).emit('role', {
                            level: 'viewer',
                            room,
                            status,
                            seconds,
                            forcePassword: currentRow.viewer
                        });
                    }
                    currentRow.lastManager = socket.id;
                }
                socket.emit('role', { level, room, status, seconds });
                // console.log(socket.id + ' joined ' + currentRow.room);
                roomFound = true;
                break;
            }
        }
        if (!roomFound) {
            socket.emit('role');
        }
    });

    socket.on('set-status', data => {
        // if (socket.user) {
        //     if (socket.user.level === 'manager') {
        console.log(socket.rooms);
        const roomIdx = offlineDb.findIndex(row => socket.rooms.has(row.room));
        if (roomIdx !== -1) {
            const row = offlineDb[roomIdx];

            if (row.lastManager === socket.id) {

                if (!row.latestTargetTime) {
                    row.seconds = 300;
                    row.latestTargetTime = moment.utc().add(300, 'seconds').format();
                }

                console.log('Data=' + data.status + '; ' + data.seconds + 's');

                const newStatus = data.status;
                const newSeconds = data.seconds;

                row.status = newStatus;
                if (newStatus === 'running') {
                    // row.seconds = newSeconds;
                    row.latestTargetTime = moment.utc().add(newSeconds, 'seconds').format();
                    row.seconds = newSeconds;
                }
                if (newStatus === 'pause') {
                    if (newSeconds !== undefined && newSeconds !== null) {
                        row.latestTargetTime = moment.utc().add(newSeconds, 'seconds').format();
                        row.seconds = newSeconds;
                    } else {
                        row.seconds = Math.floor(moment.utc(row.latestTargetTime).diff(moment(), 'seconds', true)) + 1;
                    }
                }
                console.log('Updating data on room ' + row.room + ' status=' + row.status + ' seconds=' + row.seconds);
                // console.log(row);
                io.to(row.room).emit('new-status', { status: newStatus, seconds: row.seconds });
            }
        }
        //     }
        // }
    });

    // let i = 0;
    // const interval = setInterval(() => {
    //     socket.emit('message', 'Message ' + i++);
    // }, 1000);
    socket.on('disconnect', () => {
        // console.log('Client ' + socket.id + ' disconnected.');
        // clearInterval(interval);
    })
});


setInterval(function () {

    for (let i = 0; i < offlineDb.length; i++) {
        const row = offlineDb[i];
        if (row.status === 'running') {
            // noinspection JSCheckFunctionSignatures
            row.seconds = Math.floor(moment.utc(row.latestTargetTime).diff(moment(), 'seconds', true)) + 1;
            // console.log(row.latestTargetTime);
            // console.log('Seconds: ' + row.seconds);
            cycle++;
            const forceReset = row.seconds < -1800;
            if (forceReset) {
                row.seconds = 0;
                row.status = 'pause';
            }
            if (forceReset || cycle % EMIT_CYCLE === 0) {
                io.to(row.room).emit('new-status', { status: row.status, seconds: row.seconds });
                cycle = 0;
            }
        }
    }
}, 1000);

httpServer.listen(+port, () => {
    console.log(`App started on port ${ port }, environment=` + env);
});
