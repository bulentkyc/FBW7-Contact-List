const express = require('express');
const app = express();
const hbs = require('hbs');
const path = require('path');
const multer =  require('multer');
const bodyParser = require('body-parser');
const jimp = require('jimp');
let fileName;

app.use(express.static(path.join(__dirname + '/public')));

//set storage engine
const storager = multer.diskStorage({
    //If we use / on the beginning that will be read only so we started directly foldername
    destination: 'public/uploads/',
    filename:(req,file,cb) => {
    fileName = 'av.' + Date.now() + path.extname(file.originalname);
    cb(null, fileName);
}
});

//init upload
const upload = multer({
    storage: storager
}).single('avatar');



app.use(bodyParser.urlencoded({extended:true}));

//app.use(express.json());

app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partial');

app.get('/', (req, res)=>res.render('index'));

app.post('/new-contact', (req, res)=>{
    upload(req,res, () => {
        //TBD

        jimp.read('public/uploads/' + fileName, (err, image)=>{
            if(err) throw err;
            image
                .resize(250, 250)
                .quality(60)
                .write('public/uploads/' + fileName);
        });
    });
    //Jimp does not work on here

    
    res.send(`Your contact ${req.body.name} is created!`)
});

//server listens 3000 port
app.listen(3000, function() {
    console.log('server started on port 3000');
});
