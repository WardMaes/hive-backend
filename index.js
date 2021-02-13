const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http, {
  cors: {
    origin: 'https://hive-git-fuck-p2p.wardmaes.vercel.app',
  },
})
const PORT = process.env.PORT || 3001



http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

app.get('/', (req, res) => {
  res.send('Hello world')
})

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)
  socket.emit('connected', socket.id)

  socket.on('ROOM.CREATE', (roomId) => {
    console.log('creating room', roomId)
    socket.join(roomId)
    socket.emit('ROOM.CREATED', roomId)
  })

  socket.on('ROOM.JOIN', (roomId) => {
    console.log('joining room', roomId)
    socket.join(roomId)
    socket.emit('ROOM.JOINED', roomId)
  })

  socket.on('SYNC', (context) => {
    console.log('sycning', context)
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
    console.log('disconnect', reason)
    socket.disconnect(true)
  })
})
