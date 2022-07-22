function logout() {
    console.log("로그아웃 진행")
    let token = localStorage.getItem("Authorization");
    let payload = parse_jwt(token);
    let login_type = payload["type"];
    console.log(login_type);
    if(login_type === "SOCIAL") {
        social_logout();
    }
    $.removeCookie('Set-Cookie', {path: '/'});
    localStorage.clear();
    $('#logout-alert').prop('hidden', false);
    setTimeout(function () {
        $('#logout-alert').prop('hidden', true);
        window.location.href = "https://www.devit.shop/index.html";
    }, 2000);
}

function social_logout() {
    console.log("소셜 로그아웃 진행");
    window.location.replace('https://kauth.kakao.com/oauth/logout?client_id=9988be1384b9177a905aa0f6ab1a0d66&logout_redirect_uri=https://www.devit.shop/');
}

// Bearer ***.******.***
function header_get_token() {
    let token = localStorage.getItem("Authorization");
    valid_token(token);
    token = localStorage.getItem("Authorization");
    return token;
}

// 토큰 유효시간 확인
function valid_token(token){
    let payload = parse_jwt(token);
    console.log(payload["exp"] * 1000);
    console.log(new Date().getTime());
    if (payload["exp"] * 1000 < new Date().getTime()) {
        console.log("토큰 갱신");
        refresh_token(token);
    }
}

// 토큰의 payload 파싱
function parse_jwt(bearToken) {
    if(bearToken === null){
        setTimeout(function () {
            $('#token-login-alert').prop('hidden', true);
            window.location.replace("https://www.devit.shop/login");
        }, 2000);
    }
    let token = bearToken.split(" ")[1];
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// 토큰 갱신
function refresh_token(token) {
    $.ajax({
        type: "GET",
        url: 'https://www.devit.shop/api/payment/refresh',
        data: {},
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", token);
        },
        success: function (response) {
            console.log(response)
            localStorage.setItem("access_token", response["data"]["accessToken"])
        },
        error: function (response) {
            console.log(response)
            $('#token-login-alert').prop('hidden', false);
            setTimeout(function () {
                $('#token-login-alert').prop('hidden', true);
                window.location.replace("https://www.devit.shop/login");
            }, 2000);
        }
    })
}