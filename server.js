
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
//         pass:'qvocpnlivsixerzf'
//     }
// })
// const mailOption = {
//     from: 'takeme.home.lao@gmail.com',Takeme.homerdsjklutiro134533
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
    const {emailto,subject,text,admin_id}=req.body
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'takeme.home.lao@gmail.com',
            pass:'qvocpnlivsixerzf'
        }
    })
    const mailOption = {
        from: 'takeme.home.lao@gmail.com',
        to:emailto,
        subject:'Topic:'+subject,
        text:'ເນື່ອໃນ:'+text
    }
    transporter.sendMail(mailOption,function(error,info){
        try {
            if (error) {
                console.log(error)
                return res.send({error:true,status:0,msg:'fail'})
            } else {
                dbCon.query('INSERT INTO tb_sendmail(admin_id,sendmail_email, sendmail_subject, sendmail_text) VALUES(?,?,?,?)',[admin_id,emailto,subject,text],(error,results,fields)=>{
                    try {
                        if(error) throw error;
                    } catch (error) {
                        
                    }
                })
                // console.log('Email sent:'+info.response)
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
//represent Email
app.get('/show_mail',(req,res)=>{
    dbCon.query('SELECT * FROM tb_receivemail  ORDER BY receivemail_create_at DESC',(error, results,fields)=>{
        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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

//Readed mail
app.get('/read_mail',(req,res)=>{
    let receivemail_id = req.query.receivemail_id
    dbCon.query('UPDATE tb_receivemail SET receivemail_status = 1 WHERE tb_receivemail.receivemail_id ='+receivemail_id,(error,results,fields)=>{

        try {
            if(error) throw error;
            return res.send({error:false,data:results,message:"success",status: 1})
        } catch (error) {
            
        }
    })
    
})
//event&news add
app.post('/add_events',(req,res)=>{
    const{event_topic,event_date, event_start, event_end, event_place, event_direction,admin_id}=req.body
    if (!event_topic || !event_date || !event_start || !event_end || !event_place || !event_direction || !admin_id) {
        return res.status(400).send({error : true,message:"there null field"})
    } else {
        dbCon.query('INSERT INTO tb_events(admin_id,event_topic, event_date, event_start,event_end,event_place,event_direction,event_status) VALUES(?,?,?,?,?,?,?,?)',[admin_id,event_topic,event_date, event_start,event_end, event_place, event_direction, 1],(error,results,fields)=>{
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
		if(results === undefined || results.length == 0){
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


app.get('/events_data_adm',(req,res)=>{
    dbCon.query('SELECT * FROM tb_events ',(error, results,fields)=>{
        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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
app.post('/event_switch',(req,res)=>{
    const {event_status,event_id}=req.body
    console.log(req.body)
    if (event_status=='null' || !event_id) {
        return res.status(400).send({error : true,message:"there null field"})
    } else {
        dbCon.query('UPDATE `tb_events` SET event_status=? WHERE event_id=?',[event_status,event_id],(error,results,fields)=>{
            try {
                if(error) throw error;
                return res.send({error:false,data:results,message:"success",status: 1})
            } catch (error) {
                
            }
        })
    }
})

app.post('/update_event',(req,res)=>{
    const {event_id,admin_id,event_topic,event_date,event_start, event_end,event_place,event_direction,event_status}=req.body
    console.log(req.body)
    if (!event_topic ||!event_date ||!event_start ||! event_end ||!event_place ||!event_direction ||!event_status ||!admin_id ||!event_id) {
        return res.status(400).send({error : true,message:"there null field"})
    } else {
        dbCon.query('UPDATE tb_events SET admin_id = ?,event_topic = ?,event_date = ?,event_start = ?, event_end = ?,event_place = ?,event_direction = ?,event_status=? WHERE event_id=?',[admin_id,event_topic,event_date,event_start, event_end,event_place,event_direction,event_status,event_id],(error,results,fields)=>{
            try {
                if(error) throw error;
                return res.send({error:false,data:req.body,message:"success",status: 1})
            } catch (error) {
                
            }
        })
    }
})
app.delete('/delete_event/:event_id',(req,res)=>{
    const {event_id}=req.params
    console.log(req.params)
    if (!event_id) {
        return res.status(400).send({error : true,message:"there null field"})
    } else {
        dbCon.query('DELETE FROM tb_events WHERE event_id = ?',[event_id],(error,results,fields)=>{
            try {
                if(error) throw error;
                return res.send({error:false,data:req.body,message:"success",status: 1})
            } catch (error) {
                
            }
        })
    }
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
app.post('/donateCash',(req,res)=>{
    const {admin_id,name,surname,dob,email,donate_cash_price,donate_cash_for}=req.body
    let donate_cash_bill=Date.now().toString()
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'takeme.home.lao@gmail.com',
            pass:'qvocpnlivsixerzf'
        }
    })
    const mailOption = {
        from: 'takeme.home.lao@gmail.com',
        to:email,
        subject:'Thank you For Donate',
        text:'Amound:'+donate_cash_price+'Kips'
    }
    console.log(req.body)
    if (!admin_id|| !name|| !surname|| !email|| !dob || !donate_cash_price|| !donate_cash_for) {
        return res.status(400).send({error : true,message:"there null field"})
    } else {
        dbCon.query('INSERT INTO tb_donate_cash(admin_id,name,surname,dob,email,donate_cash_bill,donate_cash_price,donate_cash_for)values(?,?,?,?,?,?,?,?)',
        [admin_id,name,surname,dob,email,crypto.createHash('md5').update(donate_cash_bill).digest('hex'),donate_cash_price,donate_cash_for],(error,results,fields)=>{
            try {
                if(error) throw error;
                transporter.sendMail(mailOption,function(error,info){
                    try {
                        if (error) {
                            console.log(error)
                            return res.send({error:true,status:0,msg:'fail'})
                        } else {
                            return res.send({error:false,data:results,message:"success",status: 1})
                        }
                    } catch (error) {
                        
                    }
                })
                // return res.send({error:false,data:results,message:"success",status: 1})
            } catch (error) {
                
            }

        })
        
    }
})
// add dog Data
app.post("/add_dog_data", upload.single('image'),(req,res)=>{

    const {dog_name,dog_dob,dog_gender,dog_species} = req.body
    let dog_img=req.file.filename
    console.log(req.body,req.file)
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
app.post("/add_dog_data_array", upload.array('images'),(req,res)=>{

    const {admin_id,dog_name,dog_dob,dog_gender,dog_species,giver_email,dog_bg} = req.body
    let dog_img=req.files[0].filename
    let dog_img2=req.files[1].filename
    // let dog_img3=req.files[2].filename
    // let dog_img4=req.files[3].filename
    // let dog_img5=req.files[4].filename
    console.log(giver_email=='null')
    // console.log(req.files)
    
    if (giver_email=='null' || !giver_email) {
        console.log('giver')
        if (!dog_name || !dog_dob || !dog_gender || !dog_species || !dog_img || !admin_id || !dog_bg) {
            return res.status(400).send({error : true,message:"there null field",status: 0})
        } else {
            dbCon.query('INSERT INTO tb_dogs (admin_id,dog_name, dog_dob, dog_gender,dog_bg, dog_species, dog_img, dog_img2) VALUES(?,?,?,?,?,?,?,?)',[admin_id,dog_name,dog_dob,dog_gender,dog_bg,dog_species,"http://localhost:3000/present/"+dog_img,"http://localhost:3000/present/"+dog_img2,"http://localhost:3000/present/"],(error, results,fields)=>{
                try {
                    if(error) throw error;
                return res.send({error:false,data:results,message:"success",status:1})
                } catch (error) {
                    
                }
            })
        }
        // return res.send({error:false,data:result,message:"success",staus:1})
    } else {
        // console.log(giver_email)
        if (!dog_name || !dog_dob || !dog_gender || !dog_species || !dog_img ||!giver_email) {
            return res.status(400).send({error : true,message:"there null field",status: 0})
        } 
        else {
            let giver_id
            dbCon.query('SELECT giver_id from tb_dog_giver WHERE giver_email = ?',giver_email,(error,result,fields)=>{
                
                try {
                    if(error) throw error;
                    let message=""
                    if (result.length===1) {
                        giver_id=result[0].giver_id
                            dbCon.query('INSERT INTO tb_dogs (admin_id,dog_name, dog_dob, dog_gender, dog_species, dog_img, dog_img2,giver_id) VALUES(?,?,?,?,?,?,?,?)',[admin_id,dog_name,dog_dob,dog_gender,dog_species,"http://localhost:3000/present/"+dog_img,"http://localhost:3000/present/"+dog_img2,giver_id],(error, results,fields)=>{
                            try {
                                return res.send({error:false,data:results,message:"succeswwawdas",status: 1})
                            } catch (error) {
                                
                            }

                        })
                    }else{
                    return res.send({error:true,data:result,message:"email is not exist",status: 3})
                    }
                } catch (error) {
                    
                }
            })
        }
    }
})
// delete dog
app.post("/status_dog_data",(req,res)=>{
    const{dog_id,dog_status } = req.body
    // console.log(req.body)
    // return res.send({error: true, message:"no id", status: 0})
    if (!dog_id) {
        return res.status(400).send({error: true, message:"no id", status: 0})
    } else {
        dbCon.query('UPDATE tb_dogs SET dog_status = ? WHERE dog_id=?',[dog_status,dog_id],(error, results,fields)=>{
            try {
                if(error) throw error;
            return res.send({error:false,data:results,message:"success",staus:1})
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
app.post("/add_admin_data", upload.single('image'),(req,res)=>{

    const{admin_name,admin_surname,admin_gender,admin_password,admin_email,admin_dob,admin_village,admin_district,admin_province,admin_workplace,admin_phoneNumber}=req.body
    
    let admin_img = req.file.filename

    if (!admin_name || !admin_surname ||!admin_gender || !admin_password || !admin_email || !admin_dob || !admin_village || !admin_district || !admin_province || !admin_workplace || !admin_phoneNumber) {
        return res.status(400).send({error : true,message:"there null field"})
    }else{

        dbCon.query('SELECT admin_email from tb_admin where admin_email = ?',admin_email,(error,result,fields)=>{
            try {
                if(error) throw error;
                let message=""
                    if (result.length === 0) {

                        dbCon.query('INSERT INTO tb_admin (admin_name, admin_surname, admin_gender, admin_password, admin_img, admin_email, admin_dob, admin_village, admin_district, admin_province, admin_workplace, admin_phoneNumber) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',[admin_name,admin_surname,admin_gender,crypto.createHash('md5').update(admin_password).digest('hex'),"http://localhost:3000/present/"+admin_img,admin_email,admin_dob,admin_village,admin_district,admin_province,admin_workplace,admin_phoneNumber],(error, results,fields)=>{
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
app.post("/giver_register", upload.single('image'),(req,res)=>{

    const{giver_name,giver_surname,giver_gender,giver_email,giver_dob,giver_village,giver_district,giver_province,giver_workplace,giver_phoneNumber,admin_id}=req.body
    
   
    // console.log(req.body)
    if (!giver_name || !giver_surname ||!giver_gender || !giver_email || !giver_dob || !giver_village || !giver_district || !giver_province || !giver_workplace || !giver_phoneNumber || !admin_id) {
        return res.status(400).send({error : true,message:"there null field"})
    }else{

        dbCon.query('SELECT giver_email from tb_dog_giver where giver_email = ?',giver_email,(error,result,fields)=>{
            console.log(result)
            try {
                let giver_img = req.file.filename
                if(error) throw error;
                let message=""
                    if (result.length === 0) {

                        dbCon.query('INSERT INTO tb_dog_giver (admin_id,giver_name, giver_surname, giver_gender, giver_img, giver_email, giver_dob, giver_village, giver_district, giver_province, giver_workplace, giver_phoneNumber) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',[admin_id,giver_name,giver_surname,giver_gender,"http://localhost:3000/present/"+giver_img,giver_email,giver_dob,giver_village,giver_district,giver_province,giver_workplace,giver_phoneNumber],(error, results,fields)=>{
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
app.get('/giver_data',(req,res)=>{
    dbCon.query('SELECT g.*,v.name_lao AS village,d.name_lao AS district, p.name_lao AS province  from tb_dog_giver g INNER JOIN tb_village v ON g.giver_village = v.id_village INNER JOIN tb_district d ON g.giver_district = d.id_district INNER JOIN tb_province p ON g.giver_province = p.id_province',(error, results,fields)=>{
        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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

app.get('/admin_data',(req,res)=>{
    dbCon.query('SELECT a.*,v.name_lao AS village,d.name_lao AS district, p.name_lao AS province  from tb_admin a INNER JOIN tb_village v ON a.admin_village = v.id_village INNER JOIN tb_district d ON a.admin_district = d.id_district INNER JOIN tb_province p ON a.admin_province = p.id_province',(error, results,fields)=>{
        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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

//log in
app.post('/login',  (req,res)=>{
    const {user_email, user_password} =req.body

    if (!user_email || !user_password) {
        
        return res.send({status: 0 })
    }else{
        dbCon.query("SELECT * FROM tb_users WHERE user_email = ? AND user_password = ?",[user_email,crypto.createHash('md5').update(user_password).digest('hex')],(error,results,fields)=>{
            try {

                console.log(results)
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

app.post('/login_adm',  (req,res)=>{
    const {admin_email, admin_password} =req.body
    console.log(req.body)
    if (!admin_email || !admin_password) {
        
        return res.send({status: 0 })
    }else{
        dbCon.query("SELECT * FROM tb_admin WHERE admin_email = ? AND admin_password = ?",[admin_email,crypto.createHash('md5').update(admin_password).digest('hex')],(error,results,fields)=>{
            try {

                console.log(results)
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

//requiredform
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
//show requiredform
app.get('/form_show',(req,res)=>{
    dbCon.query('SELECT f.*,u.user_name, d.dog_name,u.user_email FROM tb_form_adopt f INNER JOIN tb_users u ON f.user_id=u.user_id INNER JOIN tb_dogs d ON f.dog_id = d.dog_id',(error, results,fields)=>{
        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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
app.post('/divided_form',(req,res)=>{
    const{user_email,form_id,dog_id,form_status,admin_id}=req.body
    // console.log(req.body)
    // status= 1 Acecpt
    // status = 2 Decline
    // status = 3 Purchase
    if (form_status==1) {
        console.log("status = 1")
        dbCon.query('UPDATE tb_form_adopt SET form_status = ?,admin_id=? WHERE form_id=?',[form_status,admin_id,form_id],(error,results,fields)=>{
            try {   
                if(error) throw error;
                    message="update success"
                //  res.send({error:false, data:results,status:1,message:message})
                } catch (error) {
                            
            }
        })
        
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:'takeme.home.lao@gmail.com',
                pass:'qvocpnlivsixerzf'
            }
        })
        const mailOption = {
            from: 'takeme.home.lao@gmail.com',
            to:user_email,
            subject:'Your form is accepted this is Your dog you would like to adopt',
            text:'Let take him and purchase for 100 Dollars'
        }
        transporter.sendMail(mailOption,function(error,info){
            try {
                if (error) {
                    console.log(error)
                    return res.send({error:true,status:0,msg:'fail'})
                } else {
                    return res.send({error:false,data:info.response,status:1,msg:'succesfull'})
                }
            } catch (error) {
                
            }
        })
    } else if(form_status==2){
        dbCon.query('UPDATE tb_form_adopt SET form_status = ?,admin_id=? WHERE form_id=?',[form_status,admin_id,form_id],(error,results,fields)=>{
            try {   
                if(error) throw error;
                    message="update success"
                    //  res.send({error:false, data:results,status:1,message:message})
                } catch (error) {
                            
            }
        })
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:'takeme.home.lao@gmail.com',
                pass:'qvocpnlivsixerzf'
            }
        })
        const mailOption = {
            from: 'takeme.home.lao@gmail.com',
            to:user_email,
            subject:'Your form is decline this is Your dog you would like to adopt',
            text:'We are sorry your form is denie Because you are not ready to adopt them'
        }
        transporter.sendMail(mailOption,function(error,info){
            try {
                if (error) {
                    console.log(error)
                    return res.send({error:true,status:0,msg:'fail'})
                } else {
                    // console.log('Email sent:'+info.response)
                    return res.send({error:false,data:info.response,status:1,msg:'succesfull'})
                }
            } catch (error) {
                
            }
        })
    }else if (form_status==3) {
        dbCon.query('UPDATE tb_form_adopt SET form_status = ?,admin_id=? WHERE form_id=?',[form_status,admin_id,form_id],(error,results,fields)=>{
            try {   
                if(error) throw error;
                    message="update success"
                    // res.send({error:false, data:results,status:1,message:message})
                } catch (error) {
                            
            }
        })
        dbCon.query('UPDATE tb_dogs SET dog_status = ? WHERE dog_id=?',[2,dog_id],(error,results,fields)=>{
            try {   
                if(error) throw error;
                    message="update success"
                    // res.send({error:false, data:results,status:1,message:message})
                } catch (error) {
                            
            }
        })
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:'takeme.home.lao@gmail.com',
                pass:'qvocpnlivsixerzf'
            }
        })
        const mailOption = {
            from: 'takeme.home.lao@gmail.com',
            to:user_email,
            subject:'Your purchase has been successful',
            text:'Thank you for your kindly'
        }
        transporter.sendMail(mailOption,function(error,info){
            try {
                if (error) {
                    console.log(error)
                    return res.send({error:true,status:0,msg:'fail'})
                } else {
                    // console.log('Email sent:'+info.response)
                    return res.send({error:false,data:info.response,status:1,msg:'succesfull'})
                }
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
		if(results === undefined || results.length == 0){
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

app.get('/dogs_count_0',(req,res)=>{
    dbCon.query('SELECT COUNT(dog_id) as number FROM `tb_dogs` WHERE dog_status != 3',(error, results,fields)=>{
        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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

app.get('/delete_dog_info',(req,res)=>{
    dbCon.query('SELECT * ,timestampdiff(year,dog_dob,CURRENT_DATE) as age FROM tb_dogs where dog_status = 3',(error, results,fields)=>{
        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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
app.get('/dogs_data_info',(req,res)=>{
    dbCon.query('SELECT tb_dogs.* ,timestampdiff(year,dog_dob,CURRENT_DATE) as age, tb_dog_giver.giver_email FROM tb_dogs LEFT JOIN tb_dog_giver on tb_dogs.giver_id=tb_dog_giver.giver_id WHERE dog_status = 0 or dog_status = 1 or dog_status = 2 ',(error, results,fields)=>{
        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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

// update dog
app.post('/update_dogs',(req,res)=>{
    const {dog_id,dog_name,dog_dob,dog_gender,dog_species,giver_email} = req.body
    if (!giver_email) {
        if ( !dog_name || !dog_dob || !dog_gender || !dog_species || !dog_id  ) {
            console.log(req.body)
            return res.send({status: 2,message:'somefill empty' })
        } else {
            console.log(req.body)
            dbCon.query('UPDATE tb_dogs SET dog_name = ?,dog_dob = ?,dog_gender = ?,dog_species = ? WHERE dog_id=?',[dog_name,dog_dob,dog_gender,dog_species,dog_id],(error,results,fields)=>{
                try {   
                    if(error) throw error;
                        message="update success"
                        return res.send({error:false, data:results,status:1,message:message})
                    } catch (error) {
                                
                }
            })
        }
    } else {
        if (!dog_name || !dog_dob || !dog_gender || !dog_species ||!giver_email) {
            return res.status(400).send({error : true,message:"there null field",status: 0})
        } 
        else {
            let giver_id
            dbCon.query('SELECT giver_id from tb_dog_giver WHERE giver_email = ?',giver_email,(error,result,fields)=>{
            console.log(result.length === 0)
            // return res.send({error:false,message:"succeswwawdas",status: 1})
            try {
                if(error) throw error;
                let message=""
                if (result.length===1) {
                    giver_id=result[0].giver_id
                        dbCon.query('UPDATE tb_dogs SET dog_name = ?,dog_dob = ?,dog_gender = ?,dog_species = ?,giver_id=? WHERE dog_id=?',[dog_name,dog_dob,dog_gender,dog_species,giver_id,dog_id],(error, results,fields)=>{
                        try {
                            return res.send({error:false,data:results,message:"succeswwawdas",status: 1})
                        } catch (error) {
                            
                        }

                    })
                }else{
                    
                return res.send({error:true,data:result,message:"email is not exist",status: 3})
                }
            } catch (error) {
                
            }
        })
        }
    }
})

//represent Address Village District Province
app.get('/village',(req,res)=>{
    dbCon.query('SELECT * FROM tb_village',(error, results,fields)=>{
        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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
		if(results === undefined || results.length == 0){
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
		if(results === undefined || results.length == 0){
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
//dog data by id
app.get('/data_dog_id',(req,res)=>{
    let id = req.query.id
    // console.log(id)
    dbCon.query('SELECT tb_dogs.*,tb_dog_giver.giver_email FROM tb_dogs LEFT JOIN tb_dog_giver ON tb_dogs.giver_id=tb_dog_giver.giver_id where dog_id= ? AND dog_status !=3',id,(error, results,fields)=>{

        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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
//show donate
app.get('/data_donate',(req,res)=>{
    let id = req.query.id
    // console.log(id)
    dbCon.query('SELECT * FROM tb_donate where user_id= ? ORDER BY donate_create_at DESC',id,(error, results,fields)=>{

        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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

// app.get('/report_donate',(req,res)=>{
//     dbCon.query('SELECT year(donate_create_at),month(donate_create_at),SUM(donate_price) FROM tb_donate group by year(donate_create_at),month(donate_create_at) order by year(donate_create_at),month(donate_create_at)',(error, results,fields)=>{

//         try {
//             if(error) throw error;
//         let message = ""
// 		let status 
// 		if(results === undefined || results.length == 0){
// 			message ="Book table is empty"
// 			status=0
// 		}else {
// 			message ="Succesfully retrieved all books"
// 			status=1
// 		}
// 		return res.send({ error : false , data: results, message:message, status:status });
//         } catch (error) {
            
//         }
//     })

// });

app.get('/data_donateCash',(req,res)=>{
    let id = req.query.id
    // console.log(id)
    dbCon.query('SELECT tb_donate_cash.*,tb_admin.admin_email FROM tb_donate_cash INNER JOIN tb_admin ON tb_donate_cash.admin_id = tb_admin.admin_id ORDER BY donate_cash_create_at DESC',id,(error, results,fields)=>{

        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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

//update user
app.post('/update_user',(req,res)=>{
    const{user_name,user_surname,user_gender,user_dob,user_village,user_district,user_province,user_workplace,user_phoneNumber,user_id}=req.body
    if (!user_name || !user_surname || !user_gender || !user_dob || !user_village || !user_district || !user_province || !user_workplace || !user_phoneNumber || !user_id) {
        return res.send({status: 2,message:'somefill empty' })
    } else {
        
        dbCon.query('UPDATE tb_users SET user_name = ?,user_surname = ?,user_gender = ?,user_dob = ?,user_village = ?,user_district = ?,user_province = ?,user_workplace = ?,user_phoneNumber = ? WHERE user_id=?',[user_name,user_surname,user_gender,user_dob,user_village,user_district,user_province,user_workplace,user_phoneNumber,user_id],(error,results,fields)=>{
            try {   
                if(error) throw error;
                    message="update success"
                    return res.send({error:false, data:results,status:1,message:message})
                } catch (error) {
                            
            }
        })
    }
})

//show form request by user id
app.get('/show_form_uid',(req,res)=>{
    let id= req.query.id
    dbCon.query('SELECT f.form_id,f.user_id,f.dog_id, d.dog_name,f.form_status,f.form_create_at FROM tb_form_adopt as f INNER JOIN tb_users as u ON f.user_id=u.user_id INNER JOIN tb_dogs as d ON f.dog_id=d.dog_id WHERE f.user_id =? ORDER BY f.form_create_at DESC',id,(error,results,fields)=>{
        try {
            if(error) throw error;
        let message = ""
		let status 
		if(results === undefined || results.length == 0){
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


//report
app.get('/report_dog',(req,res)=>{
    let status= req.query.status

    if (status === '101') {
        dbCon.query('SELECT d.*,a.admin_email,g.giver_email FROM tb_dogs d INNER JOIN tb_admin a ON d.admin_id = a.admin_id LEFT JOIN tb_dog_giver g ON d.giver_id =g.giver_id',(error,results,fields)=>{
            try {
                if(error) throw error;
                let message=""
                let status
                if(results === undefined || results.length == 0){
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
    } else if(status !== '101'){
        dbCon.query('SELECT d.*,a.admin_email,g.giver_email FROM tb_dogs d INNER JOIN tb_admin a ON d.admin_id = a.admin_id LEFT JOIN tb_dog_giver g ON d.giver_id =g.giver_id WHERE dog_status = ?	',status,(error,results,fields)=>{
            try {
                if(error) throw error;
                let message=""
                let status
                if(results === undefined || results.length == 0){
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
    }else{
        return res.send({ error : false , message:'something wrong', status:0 });
    }

    
})
app.get('/report_user',(req,res)=>{
    dbCon.query('SELECT tb_users.*,tb_province.name_lao as province,tb_district.name_lao as district,tb_village.name_lao as village FROM tb_users INNER JOIN tb_province ON tb_users.user_province = tb_province.id_province INNER JOIN tb_district ON tb_users.user_district = tb_district.id_district INNER JOIN tb_village ON tb_users.user_village = tb_village.id_village',(error,results,fields)=>{
        try {
            if(error) throw error;
            let message=""
            let status
            if(results === undefined || results.length == 0){
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
app.get('/report_form',(req,res)=>{
    let status= req.query.status

    if (status === '101') {
        dbCon.query('SELECT tb_form_adopt.*,tb_admin.admin_email as admin_email,tb_users.user_email as user_email,tb_users.user_img as user_img,tb_dogs.dog_name as dog_name,tb_dogs.dog_img as dog_img FROM tb_form_adopt LEFT JOIN tb_admin ON tb_form_adopt.admin_id = tb_admin.admin_id INNER JOIN tb_users ON tb_form_adopt.user_id = tb_users.user_id INNER JOIN tb_dogs ON tb_form_adopt.dog_id = tb_dogs.dog_id',(error,results,fields)=>{
            try {
                if(error) throw error;
                let message=""
                let status
                if(results === undefined || results.length == 0){
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
    } else if(status !== '101'){
        dbCon.query('SELECT tb_form_adopt.*,tb_admin.admin_email as admin_email,tb_users.user_email as user_email,tb_users.user_img as user_img,tb_dogs.dog_name as dog_name,tb_dogs.dog_img as dog_img FROM tb_form_adopt LEFT JOIN tb_admin ON tb_form_adopt.admin_id = tb_admin.admin_id INNER JOIN tb_users ON tb_form_adopt.user_id = tb_users.user_id INNER JOIN tb_dogs ON tb_form_adopt.dog_id = tb_dogs.dog_id WHERE tb_form_adopt.form_status = ?	',status,(error,results,fields)=>{
            try {
                if(error) throw error;
                let message=""
                let status
                if(results === undefined || results.length == 0){
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
    }else{
        return res.send({ error : false , message:'something wrong', status:0 });
    }

    
})
app.get('/report_donate',(req,res)=>{
    dbCon.query('SELECT tb_donate.*,tb_users.user_name,tb_users.user_email FROM tb_donate INNER JOIN tb_users ON tb_donate.user_id=tb_users.user_id ORDER BY donate_create_at DESC',(error,results,fields)=>{
        try {
            if(error) throw error;
            let message=""
            let status
            if(results === undefined || results.length == 0){
                message ="Book table is empty"
                status=0
            }else {
                message ="Succesfully retrieved all books"
                status=1
            }
            console.log(results)
            return res.send({ error : false , data: results, message:message, status:status });
        } catch (error) {
            
        }
    })
})
app.get('/report_donate_cash',(req,res)=>{
    dbCon.query('SELECT tb_donate_cash.*,tb_admin.admin_email FROM tb_donate_cash INNER JOIN tb_admin ON tb_donate_cash.admin_id = tb_admin.admin_id ORDER BY donate_cash_create_at DESC',(error,results,fields)=>{
        try {
            if(error) throw error;
            let message=""
            let status
            if(results === undefined || results.length == 0){
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
app.get('/report_giver',(req,res)=>{
    dbCon.query('SELECT tb_dog_giver.*,tb_province.name_lao as province,tb_district.name_lao as district,tb_village.name_lao as village,tb_dogs.dog_name FROM tb_dog_giver INNER JOIN tb_province ON tb_dog_giver.giver_province = tb_province.id_province INNER JOIN tb_district ON tb_dog_giver.giver_district = tb_district.id_district INNER JOIN tb_village ON tb_dog_giver.giver_village = tb_village.id_village LEFT JOIN tb_dogs ON tb_dog_giver.giver_id = tb_dogs.giver_id',(error,results,fields)=>{
        try {
            if(error) throw error;
            let message=""
            let status
            if(results === undefined || results.length == 0){
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

app.get('/dog_count',(req,res)=>{
    dbCon.query('SELECT COUNT(dog_id) as num FROM tb_dogs WHERE dog_status != 3',(error,results,fields)=>{
        try {
            if(error) throw error;
            let message=""
            let status
            if(results === undefined || results.length == 0){
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

app.get('/adopt_count',(req,res)=>{
    dbCon.query('SELECT COUNT(dog_id) as num FROM tb_dogs WHERE dog_status = 2',(error,results,fields)=>{
        try {
            if(error) throw error;
            let message=""
            let status
            if(results === undefined || results.length == 0){
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

app.post('/update_giver', upload.single('image'),(req,res)=>{
    const{admin_id,giver_name,giver_surname,giver_gender,giver_email,giver_dob,giver_village,giver_district,giver_province,giver_workplace,giver_phoneNumber,giver_id}=req.body

console.log(req.body)
    if (!admin_id||!giver_name||!giver_surname||!giver_gender||!giver_email||!giver_dob||!giver_village||!giver_district||!giver_province||!giver_workplace||!giver_phoneNumber||!giver_id) {
        return res.send({error:true,status: 0,message:'somefill empty' })
    } else {
        if (req.file != null) {
            // console.log('there img')
            let giver_img = req.file.filename
            
            dbCon.query('UPDATE tb_dog_giver SET admin_id = ?,giver_name=?,giver_surname=?,giver_gender=?,giver_email=?,giver_dob=?,giver_village=?,giver_district=?,giver_province=?,giver_workplace=?,giver_phoneNumber=?,giver_img=? WHERE giver_id =?',[admin_id,giver_name,giver_surname,giver_gender,giver_email,giver_dob,giver_village,giver_district,giver_province,giver_workplace,giver_phoneNumber,"http://localhost:3000/present/"+giver_img,giver_id],(error,results,fields)=>{
    
                try {
                    if(error) throw error;
                    return res.send({error:false,data:results,message:"success there",status: 1})
                } catch (error) {
                    
                }
            })
        } else if(req.file == null) {
            // console.log('no image')
            dbCon.query('UPDATE tb_dog_giver SET admin_id = ?,giver_name=?,giver_surname=?,giver_gender=?,giver_email=?,giver_dob=?,giver_village=?,giver_district=?,giver_province=?,giver_workplace=?,giver_phoneNumber=? WHERE giver_id =?',[admin_id,giver_name,giver_surname,giver_gender,giver_email,giver_dob,giver_village,giver_district,giver_province,giver_workplace,giver_phoneNumber,giver_id],(error,results,fields)=>{
    
                try {
                    if(error) throw error;
                    return res.send({error:false,data:results,message:"success no img",status: 1})
                } catch (error) {
                    
                }
            })
        }else{
            return res.send({error:true,data:results,message:"something wrong",status: 0})
        }
    }
})

app.post('/update_admin', upload.single('image'),(req,res)=>{
    const{admin_id,admin_name,admin_surname,admin_gender,admin_email,admin_dob,admin_village,admin_district,admin_province,admin_workplace,admin_phoneNumber}=req.body

console.log(!admin_id)
    if (!admin_id||!admin_name||!admin_surname||!admin_gender||!admin_email||!admin_dob||!admin_village||!admin_district||!admin_province||!admin_workplace||!admin_phoneNumber) {
        return res.send({error:true,status: 0,message:'somefill emptywawa' })
    } else {
        if (req.file != null) {
            console.log('there img')
            let admin_img = req.file.filename
            
            dbCon.query('UPDATE tb_admin SET admin_name=?,admin_surname=?,admin_gender=?,admin_email=?,admin_dob=?,admin_village=?,admin_district=?,admin_province=?,admin_workplace=?,admin_phoneNumber=?,admin_img=? WHERE admin_id =?',[admin_name,admin_surname,admin_gender,admin_email,admin_dob,admin_village,admin_district,admin_province,admin_workplace,admin_phoneNumber,"http://localhost:3000/present/"+admin_img,admin_id],(error,results,fields)=>{
    
                try {
                    if(error) throw error;
                    return res.send({error:false,data:results,message:"success there",status: 1})
                } catch (error) {
                    
                }
            })
        } else if(req.file == null) {
            console.log('no image')
            dbCon.query('UPDATE tb_admin SET admin_name=?,admin_surname=?,admin_gender=?,admin_email=?,admin_dob=?,admin_village=?,admin_district=?,admin_province=?,admin_workplace=?,admin_phoneNumber=? WHERE admin_id =?',[admin_name,admin_surname,admin_gender,admin_email,admin_dob,admin_village,admin_district,admin_province,admin_workplace,admin_phoneNumber,admin_id],(error,results,fields)=>{
    
                try {
                    if(error) throw error;
                    return res.send({error:false,data:results,message:"success no img",status: 1})
                } catch (error) {
                    
                }
            })
        }else{
            return res.send({error:true,data:results,message:"something wrong",status: 0})
        }
    }
})

// create path Image represent
app.use('/present', express.static('./images'));






//set port 3000

app.listen(3000,()=>{
	console.log('Node App is running on port 3000' )
})
module.exports = app

// Using "npm run dev" to start project