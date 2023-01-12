const Hyperswarm = require('hyperswarm')
const prompt = require('prompt-sync')({sigint: true});
const EventEmitter = require('events');
const event = new EventEmitter();


async function main() {
    var valid = false
    var key


    while (!valid) {
        key = prompt('Enter a swarm key: ')
        if (key.length > 0) valid = true
        else console.log('Enter a non empty key')
    }

    
    const swarm = new Hyperswarm()

    swarm.on('connection', (conn, info) => {
        conn.on('data', data => console.log('Client Message:', data.toString()))
        conn.write('{"code" : "this is a test"}')
        
        conn.on('error', (error) => {
            conn.end()
            console.log('Connection to peer closed unexpectedly', error)
        })
    })

    
    const topic = Buffer.alloc(32).fill(key) // A topic must be 32 bytes
    const discovery = swarm.join(topic, { server: true, client: false })
    await discovery.flushed() // Waits for the topic to be fully announced on the DHT
    await discovery.refresh({server: true})
    console.log("Swarm with key: " + key + " successfully created")
    
    
}
main()
