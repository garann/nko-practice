exports.config = {
    build : process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
    production : {
	host : '17clones.no.de', 
	port : 80 
    },

    development : {
	host : '127.0.0.1',
	port: 8000 
    }

}