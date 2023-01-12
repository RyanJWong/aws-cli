const hyperswarm = require('hyperswarm-web')

const key = "1231231";
const swarm = hyperswarm({

  })
  

swarm.on('connection', (conn, info) => {
    conn.on('data', data => console.log('Server Message:', data.toString()))
    conn.write('this is a client connection');
})

const topic = Buffer.alloc(32).fill(key) // A topic must be 32 bytes
swarm.join(topic, { server: false, client: true })

