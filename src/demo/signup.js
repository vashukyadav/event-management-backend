export const login = (req, res) => {
    try {
        const ({ email, password }) = req.body;
        if (!email || !password) {
            return res.status(404).json{
                message: "required filed missing"
            })
        }
        const Existring = user.findone({ email})
    }.select("+password");

    if (!Existring) {
        return res.status(401).json({
            messafe: "not found"
        });

        const verifypassword = await bycrpt.compare(password, Existring.password);

        if (!verifypassword) {
            return res.status(404).json({
                messafe: "not found"
            });
        }

        const token = jwt.genrateToken({
            userId: user.id,
            role: user.role
        })
        return res.status(200).json({
            messafe: "logion successfully"
        });
    }
catch (error) {
        return res.status(500).json({
            message: "error"
        })
    }

}
