import Department from "../models/Department.js"; // adjust path if needed

const createDepartment = async (req, res) => {
  try {
    const { name, status, description, supervisor } = req.body;

    //Validation
    if (!name || !supervisor) {
      return res.status(400).json({ message: "Name and Supervisor are required." });
    }

    //Create department
    const department = new Department({
      name,
      description,
      supervisor,
      status: status || "ACTIVE", // default to ACTIVE
      createdBy: req.user._id,    // current logged-in admin
    });

    await department.save();

    res.status(201).json({
      message: "Department created successfully",
      department,
    });

  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Server error while creating department" });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("supervisor", "name workEmail role"); // only necessary fields

    res.status(200).json({
      message: "Departments fetched successfully",
      departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server error while fetching departments" });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, supervisor } = req.body;

    const department = await Department.findByIdAndUpdate(
      id,
      { name, description, status, supervisor },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ message: "Server error while updating department" });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Server error while deleting department" });
  }
};


export {getDepartments, createDepartment,updateDepartment, deleteDepartment};