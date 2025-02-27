const createUser = async (username, password, email, verificationCode, verificationCodeExpires) => {
    await poolConnect;
    const query = `
      INSERT INTO Users (username, password, email, verificationCode, verificationCodeExpires)
      VALUES (@username, @password, @email, @verificationCode, @verificationCodeExpires)
    `;
    const request = pool.request();
    request.input('username', sql.VarChar, username);
    request.input('password', sql.VarChar, password);
    request.input('email', sql.VarChar, email);
    request.input('verificationCode', sql.VarChar, verificationCode);
    request.input('verificationCodeExpires', sql.DateTime, verificationCodeExpires);
    await request.query(query);
  };