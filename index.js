const Hyperswarm = require('hyperswarm')
const prompt = require('prompt-sync')({sigint: true});
const fetch = require('node-fetch')

// Call the server on port 3000 to create a server swarm with the given key
async function init(key) {
    await fetch(`http://localhost:3000/api/swarm?key=${key}`, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    })
   
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
            // On sudden disconnect, wait for server
            console.log('Connection to server closed unexpectedly. Attempting to reestablish connection...')
            await swarm.listen()
        })
       
        // On server connection send the API request
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
    
    await init(key) // Wait  for the server's OK that the swarm is created
    // Create our own client-swarm and await 
    const topic = Buffer.alloc(32).fill(key) // A topic must be 32 bytes
    const discovery = swarm.join(topic, { server: false, client: true })
    await discovery.flushed() // Waits for the topic to be fully announced on the DHT
    console.log("Listening for peer...")
}
main()


