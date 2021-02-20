const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http, {
  cors: {
    origin: 'https://hive-git-fuck-p2p.wardmaes.vercel.app',
  },
})
const PORT = process.env.PORT || 3001


const gameStates = new Map() // <roomId, context>

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

app.get('/', (req, res) => {
  res.send('Hello world')
})

// This endpoint is called by the matchmaking backend to create a new room
app.post('/api/rooms', (req, res) => {
  console.log('POST /api/rooms', req.body)
  const { roomId } = req.body
  gameStates.set(roomId, undefined)

  return res.status(200).json({ roomId })
})

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)
  socket.emit('connected', socket.id)

  socket.on('ROOM.CREATE', (roomId) => {
    console.log('creating room', roomId)
    socket.join(roomId)
    gameStates.set(roomId, undefined)
    socket.emit('ROOM.CREATED', roomId)
  })

  socket.on('ROOM.JOIN', (roomId) => {
    console.log('joining room', roomId, gameStates.get(roomId))
    socket.join(roomId)
    socket.emit('ROOM.JOINED', roomId)
    if (gameStates.get(roomId)) {
      // TODO: if 2 players already playing, become a spectator
      console.log('joined, but game already started', gameStates.get(roomId))
      socket.emit('SYNC', gameStates.get(roomId))
    }
  })

  socket.on('SYNC', (context) => {
    console.log('sycning', context, socket.rooms)
    console.log('gamestates1', gameStates)

    const { roomId } = context
    if (roomId) {
      // TODO: this should always be passed
      gameStates.set(roomId, context)
    }

    console.log('gamestates2', gameStates)
    socket.broadcast.emit('SYNC', context)
  })

  socket.on('PLAYER.DISCONNECT', (socketId) => {
    console.log('disconnected', socketId)
  })

  socket.on('disconnecting', (reason) => {
    // TODO: warn other player
    console.log('disconnecting', reason)
  })

  socket.on('disconnect', (reason) => {
    conso