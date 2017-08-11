/**
 * Created by Jakub Man. Feel free to use any of this code for learning purposes.
 * For business purposes please reference me somewhere in the code.
 * Need something explained? Want to use this system? Contact me at jakubman1@gmail.com to get help!
 */
//Helper variable for toggling menu.
var menuHidden = true;
//This variable updates based on selected folder. Used for generating folder parent.
var currentFolderId = 0;
//This variable holds the biggest folderId. Used for creating new folder IDs
var folderId = 0;

$(document).ready(function(){
    if (typeof(Storage) === "undefined") {
        alert('Your browser does not support localStorage. To use this demo you need to switch to a modern browser.');
    }
    setInterval(updateTime, 1000);
    //Remember login
    if(localStorage.getItem("username") != null) {
        showRuntimeScreen();
    }
    //Get highest folder ID and assign it to variable
    var folderJson = getFoldersJson();
    jQuery.each(folderJson, function(i, val) {
        if(val.id > currentFolderId) {
            folderId = val.id;
        }
    });
    eventListenerUpdate();


});
/**
 *  Helper function - request fullscreen on different browsers
 */
function fullScreen() {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}
/**
 * When clicked on start button - show login screen
 */
function start() {
    fullScreen();
    $('#startup-icon').attr('src','assets/loading.gif');
    $('.login-time').css('font-size','4vw');
    setTimeout(showLogin, 250);
}
/**
 * Show login, delayed by 250ms for time font-size animation to occur
 */
function showLogin(){
    $('#powerup-button').addClass('hidden');
    $('#login-form').removeClass('hidden');
}
/**
 * Check if username is known, if it is, changes image to profile image.
 * Replace this function content with AJAX request to your username database
 */
function checkUsername() {
    var username = $('#login-username').val();
    //Todo - compare input with registered users, create profile image filename from username (this would require all images to be in the same format)
    if(username === 'admin') {
        $('#login-userimg').css("background-image", "url(assets/users/admin.jpg)");
    }
    else if(username === 'demo') {
        $('#login-userimg').css("background-image", "url(assets/users/demo.png)");
    }
    else {
        $('#login-userimg').css("background-image", "url(assets/user-default.svg)");
    }
}
/**
 * Checks username and password length when typing, if text is longer than 16 characters, makes font size smaller to fit text into 300px field.
 * @Param field - accepts values "username" or "password" as string. Used when assigning function to keypress events.
 */
function checkLength(field) {
    switch(field){
        case 'username':
            if($('#login-username').val().length > 17) {
                $('#login-username').css({"font-size":"1.2rem"});
            }
            else {
                $('#login-username').css({"font-size":"2rem"});
            }
            break;
        case 'password':
            if($('#login-password').val().length > 17) {
                $('#login-password').css("font-size","1.2rem");
            }
            else {
                $('#login-password').css("font-size","2rem");
            }
            break;
        default:
            return false;
    }
}
/**
* You should replace this system with database checks and encrypt passwords before sending them to PHP.
* I don't use PHP here, also I don't really need to protect passwords, so I'm using the worst security possible..
* You should NEVER use this in production environment
*/
function login() {
    var username = $('#login-username').val();
    //Also, never do this...
    var password = $('#login-password').val();
    //Or this..
    if((username === "demo" && password === "demo") || (username === "admin" && password === "my super secret password")) {

        //Okay, this is not a good idea either...
        localStorage.setItem("username", username);

        $('#login-username').val("");
        $('#login-password').val("");
        $('#login-err').text('');

        showRuntimeScreen();
    }
    else {
        $('#login-err').text('Invalid username or password');
    }

}
function logout() {
    toggleMenu();
    $('#workspace').empty();
    $('#workspace').append('<div class="workspace-icon" ondblclick="openCmd()"><img src="assets/terminal.png" class="workspace-icon-img"><p class="workspace-icon-name">Terminal</p></div>');
    localStorage.removeItem("username");
    $('#startup-screen').removeClass('hidden');
    $('#runtime-screen').addClass('hidden');
}
function showRuntimeScreen() {
    if(localStorage.getItem('username') !== undefined) {
        renderRuntimeScreen();
        $('#startup-screen').addClass('hidden');
        $('#runtime-screen').removeClass('hidden');
    }
}
function renderRuntimeScreen() {
    var folderJson = getFoldersJson();
    jQuery.each(folderJson, function(i, val) {
        if(val.author === localStorage.getItem("username") && val.parent === 0) {
            $('#workspace').append('<div class="workspace-icon" ondblclick="openFolder(' + val.id + ')"><img src="assets/folder.png" class="workspace-icon-img"><p class="workspace-icon-name">' + val.name + '</p></div>');
        }
    });
    eventListenerUpdate();
}
/*
* Folder structure:
* { "id": int,
*   "name": string,
*   "author": string,
*   "parent":int
* }
* */
function addFolder(name, parent) {
    folderId++;
    if(parent === null || typeof parent == 'undefined') {
        parent = currentFolderId;
    }
    var folders = localStorage.getItem("folders");
    var json;
    if(folders != null && folders != "") {
        json = JSON.parse(folders);
        json = $.merge(json, [{"id":folderId,"name":name,"author":localStorage.getItem("username"),"parent":parent}]);
    }
    else {
        json = [{"id":folderId,"name":name,"author":localStorage.getItem("username"),"parent":parent}];
    }
    if(parent === 0) {
        $('#workspace').append('<div class="workspace-icon" ondblclick="openFolder(' + folderId + ')"><img src="assets/folder.png" class="workspace-icon-img"><p class="workspace-icon-name">' + name + '</p></div>');
        eventListenerUpdate();
    }
    localStorage.setItem("folders",JSON.stringify(json));
    return json;
}
function getFoldersJson() {
    var folders = localStorage.getItem("folders");
    if(folders != null && folders != "") {
        return JSON.parse(folders);
    }
    else {
        return [];
    }
}
function toggleMenu() {
    if(menuHidden) {
        $('#menu').css('bottom','50px');
        $('#menu-toggler-img').attr('src','assets/arrow-down.png');
        menuHidden = false;
    }
    else {
        $('#menu').css('bottom','-450px');
        $('#menu-toggler-img').attr('src','assets/loading.GIF');
        menuHidden = true;
    }

}
/**
 * Executed when icon is clicked. Adds class .selected to clicked icon.
 */
function selectIcon() {
    event.stopPropagation();
    $('.selected').removeClass('selected');
    $(this).addClass('selected');
}
/**
 * Helper fuunction - unselects all selected icons
 */
function unselect() {
    $('.selected').removeClass('selected');
}
function openFolder(id) {
    unselect();
    //TODO: Folder UI and content generation
    console.log(id);
}
function openCmd() {
    unselect();
}
function closeWindow(id) {
    $('#window-' + id).remove();
}
/**
 * Helper function that updates string in element with class #time. Called every 1000ms.
 */
function updateTime() {
    var d = new Date();
    var minutes;
    var seconds;
    if(d.getMinutes() < 10) { minutes = "0" + d.getMinutes()} else { minutes = d.getMinutes() }
    if(d.getSeconds() < 10) { seconds = "0" + d.getSeconds()} else { seconds = d.getSeconds() }
    var timeString = d.getHours() + ":" + minutes + ":" + seconds;
    $('.time').each(function(){
        $(this).text(timeString);
    });

}

function eventListenerUpdate() {
    $('.workspace-icon').on('click',function(){
        event.stopPropagation();
        $('.selected').removeClass('selected');
        $(this).addClass('selected');
    });
}