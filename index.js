var http = require("http"); //express 를 사용하면 필요하지 않은것들
var url = require("url");
var fs = require("fs");
var path = require("path");


var express = require('express'),
	app = express();

var httpServer = http.createServer(app).listen(process.env.PORT);
console.log('Server has been started');

app.use(express.static('client'));

app.get('/', function(req, res) {


	res.sendFile(__dirname + '/hackathon.html');
	

	var pathname = req.path;
	console.log(pathname);

});

app.post('/api/BLABLA', function(req, res) {

  var options = {
    // host to forward to
    host:   'www.google.com',
    // port to forward to
    port:   10005,
    // path to forward to
    path:   '/api/BLABLA',
    // request method
    method: 'POST',
    // headers to send
    headers: req.headers
  };

  var creq = http.request(options, function(cres) {

    // set encoding
    cres.setEncoding('utf8');

    // wait for data
    cres.on('data', function(chunk){
      res.write(chunk);
    });

    cres.on('close', function(){
      // closed, let's end client request as well 
      res.writeHead(cres.statusCode);
      res.end();
    });

    cres.on('end', function(){
      // finished, let's finish client request as well 
      res.writeHead(cres.statusCode);
      res.end();
    });

  }).on('error', function(e) {
    // we got an error, return 500 error to client and log error
    console.log(e.message);
    res.writeHead(500);
    res.end();
  });

  creq.end();

});


app.get('/a', function(req, res) {


	res.sendFile(__dirname + '/index.html');

	var pathname = req.path;
	console.log(pathname);

});

app.get('/login', function(req, res) {

	res.sendFile(__dirname + '/index.html');

	var pathname = req.path;
	console.log(pathname);

});

app.get('/favicon.ico', function(req, res) {

	// 	//  res.sendfile(__dirname + '/test.html');

	var pathname = req.path;
	console.log(pathname);
});


app.get('*', function(req, res) {
	var pathname = req.path;
	console.log(pathname);
});


// 2015-08-02 23:18 
// process.env.PORT : cloud9 port
// upgrade http server to socket.io server
var io = require('socket.io').listen(httpServer);
console.log('Socket IO server has been started');

// 2015-08-03 10:48 
// 연결 요청, 메시지 수정.
// IP_Client = socket.handshake.address; 부분이 'connection'메세지
// 응답시에만 refresh 되어 'fromclient' 메세지 응답에도 refresh 되도록 수정
// 2015-08-04 13:05 
// 연결된 클라이언트 수 추가.

function broadcastDataURLT1(socket){//broadcast의 병목제거위해 고안


socket.broadcast.emit('URLtoC',{
	URL1 : dataURL[0] ,
	URL2 : dataURL[1] ,
	URL3 : dataURL[2] ,
	URL4 : dataURL[3] ,
	URL5 : dataURL[4] 
	
})
	
	
	
}

function broadcastDataURL(){//broadcast의 병목제거위해 고안


curSocket.emit('URLtoC',{
	URL : dataURL
})
curSocket.broadcast.emit('URLtoC',{
	URL : dataURL
})

//console.log("브로드캐스트.");
	
//	setTimeout()
	
}


var clients = [];

var dataURL = [5];//dataURL의 집합공간

var curSocket; //현재 소켓 업데이트 

var isBroadcasting = false;
var broadcastInt;

 

io.sockets.on('connection', function(socket) {
	

	var clientIp = socket.handshake.headers['x-forwarded-for'];
	curSocket = socket;//소켓 업데이트
	
	socket.emit('conSuccess', {}); //일단은 연결에 성공했다는 메세지를 보내고... 

	socket.on('joinProcess', function(data) { 		//닉네임을 받아온다.
		var nick = socket.nick = data.nick; 		//그냥 소켓 객체안에 닉네임을 때려박는다.
		clients.push({								//clients 객체배열안에 id와 nick을 묶어넣는다.
			id: socket.id,
			nick: nick
		});
		
		

		console.log('Connection from : ' + clientIp + '\n'+'nick : ' + nick + '\n'  + 'total connection : ' + clients.length);
		//joinProcess 종료, 접속에 성공했음을 나와 모두에게 알림
		socket.emit('joinSuccess', {				
			nick: nick,
			ct: clients
		});
		socket.broadcast.emit('personJoin', {
			nick: nick,
			ct: clients
		});
		
		
		if(!isBroadcasting){//브로드캐스트중이 아닐경우
			broadcastInt = setInterval(broadcastDataURL,100);//
			
			isBroadcasting =true;
			console.log('브로드캐스팅 시작.');
		}else{
			 
			 
			console.log("이미 브로드캐스팅 중");
		}
		
		
		
	});

	socket.on('fromclient', function(data) {
		socket.broadcast.emit('toclient', data); // 자신을 제외하W고 다른 클라이언트에게 보냄
		socket.emit('toclient', data); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보내려면?
		console.log('Message from ' + socket.nick + ': ' + data.msg);
		//console.log(data.users);
	});
	
	socket.on('URLfromC', function(data) {
		var index = getClientIndex(socket.id); //해당 아이디의 index를 받아옴
		dataURL[index] = data.URL;		
	//	console.log("이미지 받음:" + index);
		
		
		
		// socket.broadcast.emit('URLtoC', {
		// 	nick: socket.nick,
		// 	URL :data.URL
		// });
		
		// 자신을 제외하고 다른 클라이언트에게 보냄
		// socket.emit('toclient', data); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보내려면?
		// console.log('Message from ' + socket.nick + ': ' + data.msg);
		// //console.log(data.users);
	});

	socket.on('disconnect', function(ip) {
							//소켓아이디 받아와서
		var i = getClientIndex(socket.id);
		console.log(i);
		var nick = clients[i].nick;	
		//i 의 nick값을 미리 받아둔다.
		console.log(clients[i].nick);

		clients.splice(i, 1);				//배열 i 삭제
		//			connectCounter--; 
		//나간 사람을 제외한 사람에게 '접속자 수'와 '누가 나갔는지'를 broadcast한다.
		socket.broadcast.emit('personOut', {
			ct: clients,
			nick: nick
		});
		
		dataURL = [5];//배열 초기화
		
		if(clients.length==0){//아무도 없을경우
		
			clearInterval(broadcastInt);//브로드캐스트 인터벌 중지
			isBroadcasting =false;
			
		}
		

		console.log('The number of clients : ' + clients.length);
	});
});

function getClientIndex(id){
//	console.log(id);
		for(var i=0;i<clients.length;i++){	//아이디에 해당하는 배열 인덱스 i 찾고
			if(clients[i].id==id){break;}		
		}
		
		return i;
	
	
}
