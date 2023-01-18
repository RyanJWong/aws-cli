const Hyperswarm = require('hyperswarm')

const swarm2 = new Hyperswarm()

async function test() {


swarm2.on('connection', (conn, info) => {
  conn.on('data', data => console.log('client got message:', data.toString()))
})

const topic = Buffer.alloc(32).fill('1231231da') // A topic must be 32 bytes


swarm2.join(topic, { server: false, client: true })
await swarm2.flush() // Waits for the swarm to connect to pending peers.
}
test()
