
//require Part
const express = require("express")
const app= express()
const multer = require("multer")
const bodyParser = require("body-parser")
const mysql = require("mysql")
const cors = require("cors")
const crypto = require('crypto')
require('dotenv').config()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

// Omise payment
const omise = require('omise')({
	'publicKey': process.env.OMISE_PUBLIC_KEY,
	'secretKey': process.env.OMISE_SECRET_KEY,
});

// Set Path and Name image saved
const fileStorageEngine = multer.diskStorage({ //manage Storage Parameter
    destination:(req,file,cb)=>{
        cb(null,'./images')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'--'+file.originalname)
    }
})
// Create variable to upload image
const upload = multer({storage :fileStorageEngine})

// connection Database
const dbCon = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:'',
    database:'takemehome'
})
dbCon.connect();

//>>>>>>> API ZONE <<<<<<<<

// Homepage
app.get('/' , (req,res)=>{
	return res.send({
		error:false,
		 message: "Welcome my Friend",
		written_by: "Pelay"
	})
})

// donate gateway
app.post('/donate',async (req,res,next)=>{
    try {
        
        console.log(req.body)
        const {email , name, amount,token } = req.body
        const customer = await omise.customers.create({
            'email':       email,
            'description': name,
            'card':        token,
          });
        const charge = await omise.charges.create({
            'amount':   amount,
            'currency': 'thb',
            'customer': customer.id,
          });
        console.log('charge-->',charge)
        return res.send({ error : false , data: charge, message:'Succesfully' });
    } catch (error) {
        console.log(error)
    }

next()
});

// Represent * product
// app.get('/dogs_info', (req,res)=>{
//     dbCon.query('SELECT * FROM tb_dogs',(error, results,fields)=>{
//         if(error) throw error;
//         let message = ""
// 		let status 
// 		if(results === undefined || results.lenght == 0){
// 			message ="Book table is empty"
// 			status=0
// 		}else {
// 			message ="Succesfully retrieved all books"
// 			status=1
// 		}
// 		return res.send({ error : false , data: results, message:message, status:status });
//     })
// })

// add dog Data
app.post("/add_dog_data", upload.single('image'),(req,res)=>{

    const {dog_name,dog_dob,dog_gender,dog_species} = req.body
    let dog_img=req.file.filename
    // console.log(req.body,req.file.filename)
    if (!dog_name || !dog_dob || !dog_gender || !dog_species || !dog_img) {
        return res.status(400).send({error : true,message:"there null field"})
    } else {
        dbCon.query('INSERT INTO tb_dogs (dog_name, dog_dob, dog_gender, dog_species, dog_img) VALUES(?,?,?,?,?)',[dog_name,dog_dob,dog_gender,dog_species,"http://localhost:3000/present/"+dog_img],(error, results,fields)=>{
            if(error) throw error;
            return res.send({error:false,data:results,message:"success"})
        })
    }
})

// add user data
app.post("/add_user_data", upload.single('image'),(req,res)=>{

    const{user_name,user_surname,user_gender,user_password,user_email,user_dob,user_village,user_district,user_province,user_workplace,user_phoneNumber}=req.body
    
    let user_img = req.file.filename

    if (!user_name || !user_surname ||!user_gender || !user_password || !user_email || !user_dob || !user_village || !user_district || !user_province || !user_workplace || !user_phoneNumber) {
        return res.status(400).send({error : true,message:"there null field"})
    }else{

        dbCon.query('SELECT user_email from tb_users where user_email = ?',user_email,(error,result,fields)=>{
            if(error) throw error;
            let message=""
            if (result.length === 0) {

                dbCon.query('INSERT INTO tb_users (user_name, user_surname, user_gender, user_password, user_img, user_email, user_dob, user_village, user_district, user_province, user_workplace, user_phoneNumber) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',[user_name,user_surname,user_gender,crypto.createHash('md5').update(user_password).digest('hex'),"http://localhost:3000/present/"+user_img,user_email,user_dob,user_village,user_district,user_province,user_workplace,user_phoneNumber],(error, results,fields)=>{
            if(error) throw error;
            message = "sign up successful"
            return res.send({error:false,data:results,message:"success",status: 1})
            })   
            } else {
                message = "this email is already exist";
                return res.send({error : true, data: result, message:message, status:0})
               
            }
        })



        
    }
})

//log in
app.post('/login',  (req,res)=>{
    const {user_email, user_password} =req.body

    if (!user_email || !user_password) {
        
        return res.send({status: 0 })
    }else{
        dbCon.query("SELECT * FROM tb_users WHERE user_email = ? AND user_password = ?",[user_email,crypto.createHash('md5').update(user_password).digest('hex')],async(error,results,fields)=>{
            if(error) throw error;
            let message = ""
            if (results.length > 0) {
                
                message = "Log in Success"
                return res.send({error:false, message:message,data:results, status: 1 })
            }else{
                message = "Log in fail"
                return res.send({error:true, message:message,data:results, status: 0 })

            }
        })
    }
})

// represent Dogs data
app.get('/dogs_data',(req,res)=>{
    dbCon.query('SELECT * ,timestampdiff(year,dog_dob,CURRENT_DATE) as age FROM tb_dogs',(error, results,fields)=>{
        if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.lenght == 0){
			message ="Book table is empty"
			status=0
		}else {
			message ="Succesfully retrieved all books"
			status=1
		}
		return res.send({ error : false , data: results, message:message, status:status });
    })

});

//represent Address Village District Province
app.get('/village',(req,res)=>{
    dbCon.query('SELECT * FROM tb_village',(error, results,fields)=>{
        if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.lenght == 0){
			message ="Book table is empty"
			status=0
		}else {
			message ="Succesfully retrieved all books"
			status=1
		}
		return res.send({ error : false , data: results, message:message, status:status });
    })

});
app.get('/district',(req,res)=>{
    dbCon.query('SELECT * FROM tb_district',(error, results,fields)=>{
        if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.lenght == 0){
			message ="Book table is empty"
			status=0
		}else {
			message ="Succesfully retrieved all books"
			status=1
		}
		return res.send({ error : false , data: results, message:message, status:status });
    })

});
app.get('/province',(req,res)=>{
    dbCon.query('SELECT * FROM tb_province',(error, results,fields)=>{
        if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.lenght == 0){
			message ="Book table is empty"
			status=0
		}else {
			message ="Succesfully retrieved all books"
			status=1
		}
		return res.send({ error : false , data: results, message:message, status:status });
    })

});

app.get('/data_dog_id',(req,res)=>{
    let id = req.query.id
    // console.log(id)
    dbCon.query('SELECT * FROM tb_dogs where dog_id='+id,(error, results,fields)=>{
        if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.lenght == 0){
			message ="Book table is empty"
			status=0
		}else {
			message ="Succesfully retrieved all books"
			status=1
		}
		return res.send({ error : false , data: results, message:message, status:status });
    })

});


// create path Image represent
app.use('/present', express.static('./images'));












//set port 3000

app.listen(3000,()=>{
	console.log('Node App is running on port 3000' )
})
module.exports = app

// Using "npm run dev" to start project