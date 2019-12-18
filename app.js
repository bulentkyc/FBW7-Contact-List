const express = require('express');
const app = express();
const hbs = require('hbs');
const path = require('path');
const multer =  require('multer');
const jimp = require('jimp');
const fs = require('fs');
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



app.use(express.urlencoded({extended:true}));

//app.use(express.json());

app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partial');

app.get('/', (req, res)=>{
    let contacts;
    fs.exists('public/contact-data.dat',exist=>{
        if(exist){
            contacts = JSON.parse(fs.readFileSync('public/contact-data.dat'));
        }
    res.render('index',{contactArr:contacts});
    });
});

app.post('/new-contact', (req, res)=>{
    upload(req,res, () => {
        //TBD
        let contact = { id: Date.now(), 
                        name: req.body.name,
                        email: req.body.email,
                        avatar: fileName};
        let contactList = [];

        fs.exists('public/contact-data.dat',exist=>{
            if(exist){
            contactList = JSON.parse(fs.readFileSync('public/contact-data.dat'));
        }
        contactList.push(contact);
        fs.writeFileSync('public/contact-data.dat', JSON.stringify(contactList),(err)=>{throw err});
    });
        jimp.read('public/uploads/' + fileName, (err, image)=>{
            if(err) throw err;
            image
                .resize(250, 250)
                .quality(60)
                .write('public/uploads/' + fileName);
        });
       
        
        res.redirect('/');
    });
    //Jimp does not work on here

});

app.post('/delete-contact/:id', (req,res)=>{
    let contactList = JSON.parse(fs.readFileSync('public/contact-data.dat'));
    console.log(req.params.id, contactList.filter(val=>{
        return val.id == req.params.id;
}));
    contactList.splice(
        contactList.indexOf(
            contactList.filter(val=>{
                    return val.id == req.params.id;
            })[0]
        ),1
    );
    fs.writeFileSync('public/contact-data.dat',JSON.stringify(contactList));
    res.redirect('/');
});

//server listens 3000 port
app.listen(3000, function() {
    console.log('server started on port 3000');
});
