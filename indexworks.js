var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var urlencodedParser = bodyParser.urlencoded({extended:false});
var multer = require("multer");
var path = require('path');
var fs = require("fs"); //Модуль для работы с файловой системой

const ScanDir = require('./public/js/scan.dir');
const Config = require('./public/js/config');
const config = new Config();

const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

config.filename = './public/js/settings.js';
//config.load();
const scan_dir = new ScanDir(config);

// Переменная для отслеживания данных из форм
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//указать шаблонизатор
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(express.static(__dirname));
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
       // ext = path.extname(file.originalname);
      //  name_of_file = file.originalname.split('.').slice(0, -1).join('.');
    //    name_of_file = name_of_file + ',' + 12 + ext;
      //  filename_price = name_of_file;
        cb(null, file.originalname);
    }
});



const fileFilter = (req, file, cb) => {

    if(file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"||
        file.mimetype === "image/jpeg"){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
};
app.use(multer({storage:storageConfig, fileFilter: fileFilter}).single("filedata"));

//app.use(multer({dest:"uploads"}).single("filedata"));


app.get('/admin/', function (req, res) {
    res.render('admin', {data: req.body});
});

app.post("/admin", function (req,res,next){

    let filedata = req.file;
    // console.log(filedata);
    if (!filedata)
        res.send("Ошибка при загрузке файла");
    else
        //     res.send("Файл заружен");
        res.render('admin', {filedata: filedata});

});

app.get('/admin_tab/', function (req, res) {
    let NameLevelOne = req.query.id;
    let IndexLevelOne = 0;
    let NameLevelTwo = req.query.id2;
    let IndexLevelTwo = 0;
    obj = fillPane(IndexLevelOne, NameLevelOne, IndexLevelTwo, NameLevelTwo);
    res.render('admin_tab', {firstLevel: obj.firstLevel,
        secondLevel: obj.secondLevel,
        firstLevelname: obj.firstLevelname,
        firstLevelimg: obj.firstLevelimg,
        thirdLevel:  obj.thirdLevel,
        secondLevelname: obj.secondLevelname,
        secondLevelimg : obj.secondLevelimg
    });
});
// Проверка ссылки на страницу с контактами
app.get('/addLevelOne', function(req, res) {
    let nameLevel1 = req.query.id;
    let nameLevel2 = req.query.id2;


    console.log("get-nameLevel:" + nameLevel1 + " - " + nameLevel2);

    res.render('addLevelOne', {again: false, nameLevel1:nameLevel1, nameLevel2:nameLevel2});

});

// Проверка на получение данных из post-запроса
app.post('/addLevelOne', function (req,res){

    let namelevel1 = req.body.namelevel1;
    let namelevel2 = req.body.namelevel2;
    let filedata = req.file;
    let group = req.body.group;
    let dir = './img/' + group;
    fs.mkdirSync(dir);
    ext = path.extname(filedata.originalname);
    let newnamepath = dir + "/" + "main" + ext;
    fs.copyFile(filedata.path, newnamepath, function (err) {
        if (err) return console.error(err)
        console.log("success!")
    });
    console.log("post-nameLevel:" + namelevel1 + " - " + namelevel2);
    //для перехода в админ панель
    IndexLevelOne = 0;
    NameLevelOne = namelevel1;
    IndexLevelTwo = 0;
    NameLevelTwo = namelevel2;
    obj = fillPane(IndexLevelOne, NameLevelOne, IndexLevelTwo, NameLevelTwo);
    res.redirect('admin_tab?id=' + NameLevelOne + '&id2=' + NameLevelTwo);

});

function get_img(stringOne){
    var wheres = stringOne.lastIndexOf("img");
    stringOne = '\\' + stringOne.substring(wheres);
    return stringOne;
}

function get_level3(index_level1, index_level2){
    let item = scan_dir.firstDir()[index_level1].array[index_level2]; //получаем группу со 2 уровня
    let ar = scan_dir.getArrayImg(item.path);//получаем картинки  3 уровня
    let pict = scan_dir.getMainImg(item.path); //получаем картинку группы
    return {item, ar, pict};
}

function CleanNameAndChooseIndex(Name, itemname, IndexLevel, i_){
   //IndexLevel = 0;
    if (Name) {
        Name = Name.replace(/['"«»]/g, '');

        if (itemname === Name) {
            IndexLevel = i_;
        }

    }
    console.log("IndexLevel3:" + IndexLevel);
    return IndexLevel;
}

function fillPane(IndexLevelOne, NameLevelOne, IndexLevelTwo, NameLevelTwo){
    scan_dir.rescanDir();
    // для первого уровня
    firstLevel = scan_dir.firstDir();
    firstLevel.forEach(function (item, i, arr) {
        item.img = get_img(item.img);
        IndexLevelOne = CleanNameAndChooseIndex(NameLevelOne, item.name, IndexLevelOne, i);
    });
//  для второго уровня
    secondLevel = scan_dir.firstDir()[IndexLevelOne];
    firstLevelname = secondLevel.name;
    firstLevelimg = get_img(secondLevel.img);

    secondLevel.array.forEach(function (item, i, arr) {
        item.img = get_img(item.img);
        IndexLevelTwo = CleanNameAndChooseIndex(NameLevelTwo, item.name, IndexLevelTwo, i);
    });
    // для третьего уровня
    thirdLevel_ = get_level3(IndexLevelOne, IndexLevelTwo);
    thirdLevel = thirdLevel_.ar;
    secondLevelname =  thirdLevel_.item;
    secondLevelimg_ = thirdLevel_.pict;
    secondLevelimg = get_img(secondLevelimg_.img);
    thirdLevel.forEach(function (item, i, arr) {
        item.img = get_img(item.img);
    });
    var setOfLevels ={
        firstLevel: firstLevel,
        secondLevel: secondLevel.array,
        firstLevelname: firstLevelname,
        firstLevelimg: firstLevelimg,
        thirdLevel:  thirdLevel,
        secondLevelname: secondLevelname,
        secondLevelimg : secondLevelimg
    };
    return setOfLevels;
}


app.listen(7777);
