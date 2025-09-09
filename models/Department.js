const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workers: [{
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dailyWage: Number
  }],
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Department", DepartmentSchema);