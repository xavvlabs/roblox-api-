export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Halaman utama
    if (url.pathname === "/") {
      return Response.json({
        success: true,
        message: "Roblox API aktif"
      });
    }

    // API Roblox
    if (url.pathname.startsWith("/api/roblox/")) {
      const username = decodeURIComponent(
        url.pathname.replace("/api/roblox/", "")
      );

      if (!username) {
        return Response.json(
          {
            success: false,
            message: "Username Roblox kosong"
          },
          { status: 400 }
        );
      }

      try {
        // Cari username Roblox
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
          return Response.json(
            {
              success: false,
              message: "Username Roblox tidak ditemukan"
            },
            { status: 404 }
          );
        }

        const user = userData.data[0];

        // Ambil avatar Roblox
        const avatarResponse = await fetch(
          `https://thumbnails.roblox.com/v1/users/avatar?userIds=${user.id}&size=720x720&format=Png&isCircular=false`
        );

        const avatarData = await avatarResponse.json();

        const avatar =
          avatarData.data?.[0]?.imageUrl || null;

        return Response.json({
          success: true,
          userId: user.id,
          username: user.name,
          displayName: user.displayName,
          avatar: avatar
        });

      } catch (error) {
        return Response.json(
          {
            success: false,
            message: "Gagal menghubungkan ke Roblox"
          },
          { status: 500 }
        );
      }
    }

    return Response.json(
      {
        success: false,
        message: "Endpoint tidak ditemukan"
      },
      { status: 404 }
    );
  }
};
