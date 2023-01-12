const Hyperswarm = require('hyperswarm')
const prompt = require('prompt-sync')({sigint: true});



async function main() {
    var valid = false
    var key
    const type = "code"
    const body = "print(\'Hello World\')"
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
        
        
        conn.on('error', (error) => {
            conn.end()
            console.log('Connection to server closed unexpectedly. Attempting to reestablish connection...')
            swarm.listen()
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
    

    const topic = Buffer.alloc(32).fill(key) // A topic must be 32 bytes
    const discovery = swarm.join(topic, { server: false, client: true })
    await discovery.flushed() // Waits for the topic to be fully announced on the DHT
    console.log("Swarm with key: " + key + " successfully created")
  

    
}
main()


