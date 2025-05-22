/*  
steps to implement this

1)  import db connection , because next js works on edge
    import user model
    import bcrpyt
    import send verification email

2)  in next js we always export async function  "HTML METHOD" (request:Request){}
    steps:-     1) connect db
                2) try catch block
                3) try block;- always use await while getting data from request in next js, take input as request.json()
                4) algorithm for user signup
                    if existingUserByEmail(true)
                    {
                        if existingUserByEmail (isVerified=true)
                        {
                            success:false
                        }
                        else
                        {
                            save the updated user
                        }
                    }
                    else{
                        create a new user
                        save the new user

                        1) generate hasspassword
                        2) make expiry date
                        3) make new user
                    }
                    
                send verification email

*/

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerfied: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "User with the same username already exists",
        },
        {
          status: 500,
        }
      );
    }
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const existingUserByEmail = await UserModel.findOne({ email });

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerfied) {
        return Response.json(
          {
            success: false,
            message: "User with the same email already exists",
          },
          {
            status: 500,
          }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verifyCodeExpiry = new Date();
      verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry,
        isVerfied: false,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message:
          "User registered successfully, kindly check your email for verfication code",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("Encountered an error while registering the user", error);
    return Response.json(
      {
        success: false,
        message: "Error while registering the user",
      },
      {
        status: 500,
      }
    );
  }
}
