const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Roblox API aktif"
    });
});

app.get("/api/roblox/:username", async (req, res) => {
    try {
        const username = req.params.username;

        const userResponse = await fetch(
            "https://users.roblox.com/v1/usernames/users",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usernames: [username],
                    excludeBannedUsers: false
                })
            }
        );

        const userData = await userResponse.json();

        if (!userData.data || userData.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Username Roblox tidak ditemukan"
            });
        }

        const user = userData.data[0];

        const avatarResponse = await fetch(
            `https://thumbnails.roblox.com/v1/users/avatar?userIds=${user.id}&size=720x720&format=Png&isCircular=false`
        );

        const avatarData = await avatarResponse.json();

        const avatar =
            avatarData.data?.[0]?.imageUrl || null;

        res.json({
            success: true,
            userId: user.id,
            username: user.name,
            displayName: user.displayName,
            avatar: avatar
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal menghubungkan ke Roblox"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server berjalan di port ${PORT}`);
});
