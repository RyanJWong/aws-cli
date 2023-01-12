const Hyperswarm = require('hyperswarm')
const prompt = require('prompt-sync')({sigint: true});
const fetch = require('node-fetch')

async function init(key) {
    await fetch(`http://localhost:3000/api/swarm?key=${key}`, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    })
    .then(response => response.json())
    .then(response => console.log(JSON.stringify(response)))
}

async function main() {
    var valid = false
    var key
    const type = "code"
    const body = "print(\'Hello World! My name is testnet\')"
    const id = 12

    while (!valid) {
        key = prompt('Enter a swarm key: ')
        if (key.length > 0) valid = true
        else console.log('Enter a non empty key')
    }

    
    const swarm = new Hyperswarm()

    swarm.on('connection', (conn, info) => {
        conn.on('data', data => {
            conn.on('data', data => console.log('Server Message:', data.toString()))
        })
        
        
        conn.on('error', async(error) => {
            conn.end()
            console.log('Connection to server closed unexpectedly. Attempting to reestablish connection...')
            await swarm.listen()
        })
       
        conn.write(`
        {
            "data" : 
            {
                "type" : "${type}",
                "attributes" : {
                    "body" : "${body}"
                },
                "id" : "${id}"
            }
        }`)
    })
    
    await init(key)
    const topic = Buffer.alloc(32).fill(key) // A topic must be 32 bytes
    const discovery = swarm.join(topic, { server: false, client: true })
    await discovery.flushed() // Waits for the topic to be fully announced on the DHT
    console.log("Listening for peer...")
  

    
}
main()


