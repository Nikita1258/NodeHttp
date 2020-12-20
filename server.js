const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 8888;
const list = [];
const handlers = [];

handlers.push(Root, GetList, AppendList, NotFound);

const server = http.createServer((req, res) => {
    try {
        let i = 0;
        let result;
        do
            result = handlers[i++](req, res);
        while(!result);        
    } catch (error) {
        res.statusCode = 500;
        res.end();
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function Root(req, res){
    if(req.url != '/')
        return false;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Charset', 'UTF-8');
    res.end(fs.readFileSync('index.html'), 'UTF-8', null);
    return true;
}

function GetList(req, res){
    if(req.url != '/list' || req.method != 'GET')
        return false;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/json');
    res.setHeader('Charset', 'UTF-8');
    res.end(JSON.stringify(list));
    return true;
}

function AppendList(req, res){
    if(req.url != '/list' || req.method != 'POST')
        return false;

        req.on('data', (chunk) => {
                
            let obj = JSON.parse(chunk.toString('UTF-8'));
            if(!obj || !obj.author || !obj.message)
            {
                res.statusCode = 400;
                res.end();
                return;
            }
            let date = new Date();
            list.unshift({
                'author': obj.author, 
                'message': obj.message, 
                'dateTime': `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} ` +
                `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            });
            list.splice(5);
            res.statusCode = 202;
            res.end(JSON.stringify(list[0]));
        });
    return true;
}

function NotFound(req, res){
    res.statusCode = 404;
    res.end();
    return true;
}