var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var urlencodedParser = bodyParser.urlencoded({extended:false});
var multer = require("multer");
var path = require('path');
var fs = require("fs"); //Модуль для работы с файловой системой
var rimraf = require('rimraf'); //Модуль для удаления каталога

const ScanDir = require('./public/js/scan.dir');
const Config = require('./public/js/config');
const config = new Config();

const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

config.filename = './public/js/settings.js';
//config.load();
const scan_dir = new ScanDir(config);

const noImage = '/img/no-image.png';

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

    let nameLevel1 = req.query.id;
    let nameLevel2 = req.query.id2;
    let del = req.query.del;
    let l = req.query.l;
    let item_key = req.query.item_key;
    console.log(del + "-" + l);
    console.log(scan_dir._cfg.imgdir);
    if (del =='yes')
    {
        switch (l) {
            case '1':
                DeleteCatalogLevelOne(item_key, nameLevel1);
                break;
            case '2':
                console.log(l);
                DeleteCatalogLevelTwo(item_key,namelevel1, nameLevel2);
                break;
            case '3':

                DeleteCatalogLevelThree(namelevel1, namelevel2, key, group, filedata, price, price_level2);
                break;
            default:
                console.log("switch по умолчанию");
        }
    }


    scan_dir.rescanDir();

    firstLevel = scan_dir.firstDir();
    firstIndex = scan_dir.getIndexForName(undefined,undefined, req.query.id);
    if (!firstIndex)
        firstIndex = 0;

    secondLevel = scan_dir.secondDirForIndex(firstIndex);
    secondIndex = scan_dir.getIndexForName(firstIndex, undefined, req.query.id2);
    if (!req.query.id2)
        secondIndex = 0;
    if (!secondIndex)
        secondIndex = 0;

    thirdLevel = [];
    if (secondLevel.length !== 0)
        thirdLevel = scan_dir.thirdDirForIndex(firstIndex, secondIndex);


    res.render('admin_tab', {
            firstLevel: firstLevel,
            secondLevel: secondLevel,
            thirdLevel: thirdLevel,
            firstIndex: firstIndex,
            secondIndex: secondIndex,
            noImage: noImage
    });

    //
    // console.log(firstLevel);
    //
    // let NameLevelOne = req.query.id;
    // let data = ChooseItemOne(NameLevelOne);
    // let key = chooseKey(data);
    // let IndexLevelOne = 0;
    // let NameLevelTwo = req.query.id2;
    // let IndexLevelTwo = 0;
    //
    // obj = fillPane(IndexLevelOne, NameLevelOne, IndexLevelTwo, NameLevelTwo);
    //
    // res.render('admin_tab', {firstLevel: obj.firstLevel,
    //     secondLevel: obj.secondLevel,
    //     firstLevelname: obj.firstLevelname,
    //     firstLevelimg: obj.firstLevelimg,
    //     thirdLevel:  obj.thirdLevel,
    //     secondLevelname: obj.secondLevelname,
    //     secondLevelimg : obj.secondLevelimg,
    //     key: key
    // });
});

app.get('/addLevelOne', function(req, res) {
    let l = req.query.l;
    let nameLevel1 = req.query.id;
    let nameLevel2 = req.query.id2;
    let key = req.query.key;
    let price_level2 = req.query.price_level2;




    res.render('addLevelOne', {again: false, nameLevel1:nameLevel1, nameLevel2:nameLevel2, l:l, key:key, price_level2:price_level2});

});

// Проверка на получение данных из post-запроса
app.post('/addLevelOne', function (req,res){

    let namelevel1 = req.body.namelevel1;
    let namelevel2 = req.body.namelevel2;

    let filedata = req.file;
    let key = req.body.key;
    let group = req.body.group;
    let price = req.body.price;
    let l = req.body.l;
    let price_level2 = req.body.price_level2;


    switch (l) {
        case '1':

            CreateCatalogLevelOne( key, group, filedata);
            break;
        case '2':

            CreateCatalogLevelTwo(namelevel1, key, group, filedata, price);
            break;
        case '3':

            CreateCatalogLevelThree(namelevel1, namelevel2, key, group, filedata, price, price_level2);
            break;
        default:

            console.log("switch по умолчанию");
    }


    //для перехода в админ панель
    IndexLevelOne = 0;
    NameLevelOne = namelevel1;
    IndexLevelTwo = 0;
    NameLevelTwo = namelevel2;
    //console.log();
    obj = fillPane(IndexLevelOne, NameLevelOne, IndexLevelTwo, NameLevelTwo);

    res.redirect('admin_tab?id=' + NameLevelOne + '&id2=' + NameLevelTwo);

});

app.get('/editLevelOne', function(req, res) {
    let l = req.query.l;
    let nameLevel1 = req.query.id;
    let nameLevel2 = req.query.id2;
    let key = req.query.key;
    let price_level2 = req.query.price_level2;




    res.render('editLevelOne', {again: false, nameLevel1:nameLevel1, nameLevel2:nameLevel2, l:l, key:key, price_level2:price_level2});

});

app.get('/deleteLevelOne', function(req, res) {
    let l = req.query.l;
    let nameLevel1 = req.query.id;
    let nameLevel2 = req.query.id2;
    let key = req.query.key;
    let price_level2 = req.query.price_level2;




    res.render('deleteLevelOne', {again: false, nameLevel1:nameLevel1, nameLevel2:nameLevel2, l:l, key:key, price_level2:price_level2});

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

function ChooseIndex(Name, itemname, IndexLevel, i_){

   //IndexLevel = 0;
     if (Name) {
     //   Name = Name.replace(/['"«»]/g, '');

        if (itemname === Name) {
            IndexLevel = i_;
        }

    }
    return IndexLevel;
}

function ChooseItemOne(Name){
    console.log("Name: " +Name);
    let  choose_item;
    firstLevel = scan_dir.firstDir();

    firstLevel.forEach(function (item, i, arr) {
        console.log("Name внутри" + Name);
        console.log(item.name);
        if (Name) {
            if (item.name === Name) {
                choose_item = item;
            }

        }
    });
    return choose_item;
}
function ChooseItemOneKey(Key_){

    let  choose_item;
    firstLevel = scan_dir.firstDir();

    firstLevel.forEach(function (item, i, arr) {

        console.log(item.key);

            if (item.key === Key_) {
                choose_item = item;
            }


    });
    return choose_item;
}
function chooseKey(data)
{
    for(key in data) {
        if(data.hasOwnProperty(key)) {
            var value = data[key];
        }
    }
    return value;
}

function fillPane(IndexLevelOne, NameLevelOne, IndexLevelTwo, NameLevelTwo){


    scan_dir.rescanDir();
    // для первого уровня
    firstLevel = scan_dir.firstDir();
    firstLevel.forEach(function (item, i, arr) {
        item.img = get_img(item.img);

        IndexLevelOne = ChooseIndex(NameLevelOne, item.name, IndexLevelOne, i);
    });
//  для второго уровня
    secondLevel = scan_dir.firstDir()[IndexLevelOne];
    firstLevelname = secondLevel.name;
    firstLevelimg = get_img(secondLevel.img);

    secondLevel.array.forEach(function (item, i, arr) {
        item.img = get_img(item.img);
        IndexLevelTwo = ChooseIndex(NameLevelTwo, item.name, IndexLevelTwo, i);
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


function CreateCatalogLevelOne(key, group, filedata)
{
    let dir = scan_dir._cfg.imgdir + key + '.' + group;
    fs.mkdirSync(dir);
    ext = path.extname(filedata.originalname);
    let newnamepath = dir + "/" + "main" + ext;
    fs.copyFile(filedata.path, newnamepath, function (err) {
        if (err) return console.error(err)
        console.log("success!")
    });

}

function CreateCatalogLevelTwo(namelevel1, key, group, filedata, price)
{

    namelevel1 = namelevel1.replace(/['"«»]/g, '');

    let dir = scan_dir._cfg.imgdir + key + '.' + namelevel1 + '/' + group + ',' + price;
    console.log(dir);
    fs.mkdirSync(dir);
    ext = path.extname(filedata.originalname);
    CopyImg("main", filedata, dir);
    CopyImg("group", filedata, dir);

}

function CreateCatalogLevelThree(namelevel1, namelevel2, key, group, filedata, price, price_level2)
{

    namelevel1 = namelevel1.replace(/['"«»]/g, '');

    let dir = scan_dir._cfg.imgdir + key + '.' + namelevel1 + '/' + namelevel2 + ',' + price_level2;
    console.log(dir);
  //  fs.mkdirSync(dir);
    ext = path.extname(filedata.originalname);
    let newname= group + ',' + price;
    CopyImg(newname, filedata, dir);

}

function CopyImg(main_group, filedata, dir) {
    let newnamepath = dir + "/" + main_group + ext;
    fs.copyFile(filedata.path, newnamepath, function (err) {
        if (err) return console.error(err)
        console.log("success!")
    });
}

function  DeleteCatalogLevelOne(item_key, nameLevel1)
{
    let dir = scan_dir._cfg.imgdir + item_key + '.' + nameLevel1;
    console.log("(item_key, nameLevel:" + item_key + "," + nameLevel1 + "," + dir);
    rimraf.sync(dir);
}

function  DeleteCatalogLevelOne(item_key, nameLevel1, nameLevel1)
{
    let dir = scan_dir._cfg.imgdir + item_key + '.' + nameLevel1;
    console.log("(item_key, nameLevel:" + item_key + "," + nameLevel1 + "," + dir);
   // rimraf.sync(dir);


}

app.listen(7777);
