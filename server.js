
//require Part
const express = require("express")
const app= express()
const multer = require("multer")
const bodyParser = require("body-parser")
const mysql = require("mysql")
const cors = require("cors")
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const { info } = require("console")
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

//NodeMailler
// const transporter = nodemailer.createTransport({
//     service:'gmail',
//     auth:{
//         user:'takeme.home.lao@gmail.com',
//         pass:'Takeme.homerdsjklutiro134533'
//     }
// })
// const mailOption = {
//     from: 'takeme.home.lao@gmail.com',
//     to:'konepadithspydee@gmail.com',
//     subject:'Sending Email using Nodejs',
//     text:"Hi I'm Batman"
// }
// transporter.sendMail(mailOption,function(error,info){
//     if (error) {
//         console.log(error)
//     } else {
//         console.log('Email sent:'+info.response)
//     }
// })

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
//send email
app.post('/mailing',(req,res)=>{
    const {emailto,subject,text}=req.body
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'takeme.home.lao@gmail.com',
            pass:'Takeme.homerdsjklutiro134533'
        }
    })
    const mailOption = {
        from: 'takeme.home.lao@gmail.com',
        to:emailto,
        subject:subject,
        text:text
    }
    transporter.sendMail(mailOption,function(error,info){
        try {
            if (error) {
                console.log(error)
                return res.send({error:true,status:0,msg:'fail'})
            } else {
                console.log('Email sent:'+info.response)
                return res.send({error:false,data:info.response,status:1,msg:'succesfull'})
            }
        } catch (error) {
            
        }
    })
    
})

//receive mail
app.post('/receive',(req,res)=>{
    const{mail_name,mail_surname,mail_email,mail_phone,mail_call,mail_topic,mail_msg}=req.body
    // console.log(req.body)
    // return res.send({error : false,message:"success"})
    if (!mail_name || !mail_surname || !mail_email || !mail_phone || !mail_call || !mail_topic ||!mail_msg) {
        return res.status(400).send({error : true,message:"there null field"})
    } else {
        dbCon.query('INSERT INTO tb_receivemail(receivemail_name, receivemail_surname, receivemail_email,receivemail_phone,receivemail_call,receivemail_topic,receivemail_msg) VALUES(?,?,?,?,?,?,?)',[mail_name,mail_surname,mail_email,mail_phone,mail_call,mail_topic,mail_msg],(error,results,fields)=>{
            try {
                if(error) throw error;
            return res.send({error:false,data:results,message:"success",status: 1})
            } catch (error) {
                
            }
        })
    }
})

//event&news add
app.post('/add_events',(req,res)=>{
    const{event_topic,event_date, event_start, event_end, event_place, event_direction}=req.body
    if (!event_topic || !event_date || !event_start || !event_end || !event_place || !event_direction) {
        return res.status(400).send({error : true,message:"there null field"})
    } else {
        dbCon.query('INSERT INTO tb_events(event_topic, event_date, event_start,event_end,event_place,event_direction,event_status) VALUES(?,?,?,?,?,?,?)',[event_topic,event_date, 'From '+event_start, 'To '+event_end, event_place, event_direction, 1],(error,results,fields)=>{
            try {
                if(error) throw error;
            return res.send({error:false,data:results,message:"success",status: 1})
            } catch (error) {
                
            }
        })
    }
})

//represent Events
app.get('/events_data',(req,res)=>{
    dbCon.query('SELECT * FROM tb_events where event_status = 1',(error, results,fields)=>{
        try {
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
        } catch (error) {
            
        }
    })
})

// donate gateway
app.post('/donate',async (req,res,next)=>{
    try {
        
        // console.log(req.body)
        const {email , name, amount,token,user_id } = req.body
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
        // console.log('charge-->',charge.transaction)
        dbCon.query('INSERT INTO tb_donate(user_id,donate_bill,donate_price) VALUES(?,?,?)',[user_id,charge.transaction,amount]),(error, results,fields)=>{
            if(error) throw error;
        }
        return res.send({ error : false , data: charge, message:'Succesfully',status:1 });
    } catch (error) {
        // console.log(error)
        return res.send({ error : true , message:'Fail',status:0 });
    }

next()
});
// add dog Data
app.post("/add_dog_data", upload.single('image'),(req,res)=>{

    const {dog_name,dog_dob,dog_gender,dog_species} = req.body
    let dog_img=req.file.filename
    // console.log(req.body,req.file.filename)
    if (!dog_name || !dog_dob || !dog_gender || !dog_species || !dog_img) {
        return res.status(400).send({error : true,message:"there null field"})
    } else {
        dbCon.query('INSERT INTO tb_dogs (dog_name, dog_dob, dog_gender, dog_species, dog_img) VALUES(?,?,?,?,?)',[dog_name,dog_dob,dog_gender,dog_species,"http://localhost:3000/present/"+dog_img],(error, results,fields)=>{
            try {
                if(error) throw error;
            return res.send({error:false,data:results,message:"success"})
            } catch (error) {
                
            }
        })
    }
})

// add dog Data array
app.post("/add_dog_data_array", upload.array('images',5),(req,res)=>{

    const {dog_name,dog_dob,dog_gender,dog_species} = req.body
    let dog_img=req.files[0].filename
    let dog_img2=req.files[1].filename
    let dog_img3=req.files[2].filename
    let dog_img4=req.files[3].filename
    let dog_img5=req.files[4].filename
    console.log(req.files[1].filename)
    // res.send("multi appry")
    // console.log(req.body,req.file.filename)
    if (!dog_name || !dog_dob || !dog_gender || !dog_species || !dog_img) {
        return res.status(400).send({error : true,message:"there null field"})
    } else {
        dbCon.query('INSERT INTO tb_dogs (dog_name, dog_dob, dog_gender, dog_species, dog_img, dog_img2,dog_img3,dog_img4,dog_img5) VALUES(?,?,?,?,?,?,?,?,?)',[dog_name,dog_dob,dog_gender,dog_species,"http://localhost:3000/present/"+dog_img,"http://localhost:3000/present/"+dog_img2,"http://localhost:3000/present/"+dog_img3,"http://localhost:3000/present/"+dog_img4,"http://localhost:3000/present/"+dog_img5],(error, results,fields)=>{
            try {
                if(error) throw error;
            return res.send({error:false,data:results,message:"success"})
            } catch (error) {
                
            }
        })
    }
})

// register
app.post("/add_user_data", upload.single('image'),(req,res)=>{

    const{user_name,user_surname,user_gender,user_password,user_email,user_dob,user_village,user_district,user_province,user_workplace,user_phoneNumber}=req.body
    
    let user_img = req.file.filename

    if (!user_name || !user_surname ||!user_gender || !user_password || !user_email || !user_dob || !user_village || !user_district || !user_province || !user_workplace || !user_phoneNumber) {
        return res.status(400).send({error : true,message:"there null field"})
    }else{

        dbCon.query('SELECT user_email from tb_users where user_email = ?',user_email,(error,result,fields)=>{
            try {
                if(error) throw error;
            let message=""
                    if (result.length === 0) {

                        dbCon.query('INSERT INTO tb_users (user_name, user_surname, user_gender, user_password, user_img, user_email, user_dob, user_village, user_district, user_province, user_workplace, user_phoneNumber) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',[user_name,user_surname,user_gender,crypto.createHash('md5').update(user_password).digest('hex'),"http://localhost:3000/present/"+user_img,user_email,user_dob,user_village,user_district,user_province,user_workplace,user_phoneNumber],(error, results,fields)=>{
                    try {
                        if(error) throw error;
                    message = "sign up successful"
                    return res.send({error:false,data:results,message:"success",status: 1})
                    } catch (error) {
                        
                    }
                    })   
                    } else {
                        message = "this email is already exist";
                        return res.send({error : true, data: result, message:message, status:0})
                    
                    }
            } catch (error) {
                
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
        dbCon.query("SELECT * FROM tb_users WHERE user_email = ? AND user_password = ?",[user_email,crypto.createHash('md5').update(user_password).digest('hex')],(error,results,fields)=>{
            try {
                if(error) throw error;
            let message = ""
            if (results.length > 0) {
                
                message = "Log in Success"
                return res.send({error:false, message:message,data:results, status: 1 })
            }else{
                message = "Log in fail"
                return res.send({error:true, message:message,data:results, status: 0 })

            }
            } catch (error) {
                
            }
        })
    }
})

//requireddorm
app.post('/required',  (req,res)=>{
    const {user_id,dog_id,q_1,q_2,q_3,q_4,q_5,q_6,q_7,q_8,q_9,q_10,q_11,q_12,q_13,q_14,q_15,q_16,q_17,q_18,q_19} =req.body
    console.log(req.body)




    if (!user_id|| !dog_id || !q_1|| !q_3|| !q_5|| !q_7|| !q_8|| !q_9|| !q_10|| !q_11|| !q_12|| !q_13|| !q_14|| !q_15|| !q_16|| !q_17|| !q_18|| !q_19) {
        return res.send({status: 0 })
    }else{
        dbCon.query("INSERT INTO tb_form_adopt (user_id,dog_id,q_1,q_2,q_3,q_4,q_5,q_6,q_7,q_8,q_9,q_10,q_11,q_12,q_13,q_14,q_15,q_16,q_17,q_18,q_19) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[user_id,dog_id,q_1,q_2,q_3,q_4,q_5,q_6,q_7,q_8,q_9,q_10,q_11,q_12,q_13,q_14,q_15,q_16,q_17,q_18,q_19],(error,results,fields)=>{
            try {
                if(error) throw error;
            let message = ""
            message = "sign up successful"
            return res.send({error:false,data:results,message:"success",status: 1})
            } catch (error) {
                
            }
        })
    }
})

// represent Dogs data
app.get('/dogs_data',(req,res)=>{
    dbCon.query('SELECT * ,timestampdiff(year,dog_dob,CURRENT_DATE) as age FROM tb_dogs where dog_status = 0',(error, results,fields)=>{
        try {
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
        } catch (error) {
            
        }
    })

});

//represent Address Village District Province
app.get('/village',(req,res)=>{
    dbCon.query('SELECT * FROM tb_village',(error, results,fields)=>{
        try {
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
        } catch (error) {
            
        }
    })

});
app.get('/district',(req,res)=>{
    dbCon.query('SELECT * FROM tb_district',(error, results,fields)=>{
        try {
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
        } catch (error) {
            
        }
    })

});
app.get('/province',(req,res)=>{
    dbCon.query('SELECT * FROM tb_province',(error, results,fields)=>{
        try {
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
        } catch (error) {
            
        }
    })

});

app.get('/data_dog_id',(req,res)=>{
    let id = req.query.id
    // console.log(id)
    dbCon.query('SELECT * FROM tb_dogs where dog_id='+id,(error, results,fields)=>{

        try {
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
        } catch (error) {
            
        }

        
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