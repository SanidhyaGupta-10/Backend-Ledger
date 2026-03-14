import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    email: string;
    name: string;
    password: string;
    systemUser: boolean;
    comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: [ true, "Email is required for creating a user" ],
        trim: true,
        lowercase: true,
        match: [ /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid Email address" ],
        unique: [ true, "Email already exists." ] as any
    },
    name: {
        type: String,
        required: [ true, "Name is required for creating an account" ]
    },
    password: {
        type: String,
        required: [ true, "Password is required for creating an account" ],
        minlength: [ 6, "password should contain more than 6 character" ],
        select: false
    },
    systemUser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
}, {
    timestamps: true
});

userSchema.pre<IUser>("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
});

userSchema.methods.comparePassword = async function (this: IUser, password: string): Promise<boolean> {
    console.log(password, this.password);
    return await bcrypt.compare(password, this.password);
};

const userModel: Model<IUser> = mongoose.model<IUser>("user", userSchema);

export default userModel;