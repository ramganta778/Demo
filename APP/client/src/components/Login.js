import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  let emailInputRef = useRef();
  let passwordInputRef = useRef();

  let dispatch = useDispatch();
  let navigate = useNavigate();

  let validateLogin = async () => {
    let dataToSend = new FormData();

    dataToSend.append("email", emailInputRef.current.value);
    dataToSend.append("password", passwordInputRef.current.value);

    let reqOptions = {
      method: "POST",
      body: dataToSend,
    };

    // Update the URL here to point to your backend
    let JSONData = await fetch("http://13.61.7.193:3000/login", reqOptions);

    let JSOData = await JSONData.json();

    if (JSOData.status === "success") {
      dispatch({ type: "login", data: JSOData.data });
      navigate("/Home");
    } else {
      alert(JSOData.msg);
    }

    console.log(JSOData);
  };

  return (
    <div className="login">
      <form>
        <div>
          <label>Email id</label>
          <input ref={emailInputRef}></input>
        </div>

        <div>
          <label>Password</label>
          <input ref={passwordInputRef} type="password"></input>
        </div>
        <button
          onClick={() => {
            validateLogin();
          }}
          type="button"
        >
          Login
        </button>

        <button>
          <Link to={"/SignUp"}>SignUp</Link>
        </button>
      </form>
    </div>
  );
}

export default Login;
