/**
 * Created by Jakub Man. Feel free to use any of this code for learning purposes.
 * For business purposes please reference me somewhere in the code.
 * Need something explained? Want to use this system? Contact me at jakubman1@gmail.com to get help!
 */
//Helper variable for toggling menu.
var menuHidden = true;
//This variable updates based on selected folder. Used for generating folder parent.
var currentFolderId = 0;
//This variable holds the biggest folder ID. Used for creating new folders
var folderId = 0;
//This variable holds the biggest Window ID. Used for creating new windows
var windowId = 0;

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
/**
 * Returns object of singe folder with given ID.
 * Returns empty object if folder was not found
 */
function getFolderById(id) {
    var json = getFoldersJson();
    var result = {};
    jQuery.each(json, function(i, val) {
        if(val.id == id) {
            result = val;
            //If result is found, stop looping
            return result;
        }
    });
    return result;
}
function getFoldersByParent(parentId){

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
function openWindow(name, content) {
    windowId++;
    $('#workspace').append('<div class="window" id="window-'+ windowId +'">\n' +
        '            <div class="window-toolbar">\n' +
        '                <div class="window-close" onclick="closeWindow(' + windowId +')">x</div>\n' +
        '                <p class="window-name">' + name + '</p>\n' +
        '            </div>\n' +
        '            <div class="window-content">\n' +
        '\n' + content +
        '            </div>\n' +
        '        </div>');
}
function openFolder(id) {
    unselect();
    var folderInfo = getFolderById(id);
    console.log(folderInfo);
    if(!jQuery.isEmptyObject(folderInfo) && folderInfo.author === localStorage.getItem("username")) {
        openWindow(folderInfo.name,"Test");
        eventListenerUpdate();
    }
    else {
        console.log('Script tried to open folder with ID ' + id + ', but folder with that ID does not exist or you do not have a permission to open it')
    }
}
function openCmd() {
    unselect();
    openWindow('Terminal', '<div class="terminal"></div><input class="terminal-input" type="text">');
    eventListenerUpdate();
    updateCommandListening();
}
function closeWindow(id) {
    $('#window-' + id).remove();
}
function getTime() {
    var d = new Date();
    var minutes;
    var seconds;
    if(d.getMinutes() < 10) { minutes = "0" + d.getMinutes()} else { minutes = d.getMinutes() }
    if(d.getSeconds() < 10) { seconds = "0" + d.getSeconds()} else { seconds = d.getSeconds() }
    var timeString = d.getHours() + ":" + minutes + ":" + seconds;
    return timeString;

}
/**
 * Helper function that updates string in element with class .time. Called every 1000ms.
 */
function updateTime() {
    $('.time').each(function(){
        $(this).text(getTime());
    });

}

function appendToTerminal(text) {
    $('.window-active .window-content .terminal').append(localStorage.getItem('username') + '@' + getTime() + '> ' + text + '<br>')
}

function eventListenerUpdate() {
    $('.workspace-icon').on('click',function(){
        event.stopPropagation();
        $('.selected').removeClass('selected');
        $(this).addClass('selected');
    });
    $('.window').on('mousedown', function(){
        $('.window-active').removeClass('window-active');
        $(this).addClass('window-active');
    });
    $( ".window" ).draggable({ handle: ".window-toolbar" });
    $('.terminal').on('click', function(){
        $('.window-active .window-content .terminal-input').focus();
    });
}
function updateCommandListening() {
    $(".terminal-input").keyup(function(event){
        if(event.keyCode == 13){
            var commandString = $(this).val();
            $(this).val('')
            appendToTerminal(commandString);
            var command = commandString.split(" ");
            console.log(command);
            switch (command[0]) {
                //mkdir command
                case 'mkdir':
                    if(command[1]!== undefined) {
                        if(command[2] !== undefined) {
                            if(!isNaN(command[2])) {
                                var folderInfo = getFolderById(command[2]);
                                console.log(folderInfo);
                                if(!jQuery.isEmptyObject(folderInfo) && folderInfo.author === localStorage.getItem("username")) {
                                    addFolder(command[1],command[2]);
                                    appendToTerminal('Folder ' + command[1] + ' created in folder ' + folderInfo.name + ' (id ' + folderInfo.id + ')');
                                }
                                else {
                                    appendToTerminal('Folder with ID ' + command[2] + " does not exist or you don't have a permission to write to it.");
                                }
                            }
                            else {
                                appendToTerminal('Parent ID must be a number');
                            }
                        }
                        else {
                            addFolder(command[1],0);
                            appendToTerminal('Folder ' + command[1] + ' created');
                        }
                    }
                    else {
                        appendToTerminal("Folder name can't be empty");
                    }
                    break;
                //Clear command
                case 'clear':
                    $('.terminal').empty();
                    break;
                default:
                    appendToTerminal(command[0] + ' is not a valid command.');
            }
        }
    });
}