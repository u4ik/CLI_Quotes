#!/usr/bin/env node
import os from "os";
import fs from "fs";
import cliSpinners from 'cli-spinners';
import fetch from "node-fetch";
import prompts from 'prompts';
import CFonts from 'cfonts';
import ora, { oraPromise } from 'ora';
import pkg from 'kleur';
import { exec } from "child_process";
const cRequire = createRequire(import.meta.url);
import { createRequire } from "module";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { version } = cRequire('./package.json');
const { green, red, blue } = pkg;

/** TODO : -  
 * npm root -g - command for finding root npm library
//? /* NOTE - 
 * ? - Detect OS and trickle down to the correct path for Shell use
 * ?    - Code-split to have a function which can take in arbitrary arguments to "handleShell"
 * ?     - In this way, I can use this function to handle the operations of using a different shell.
 * ?   Create options file.
*/

async function main() {
    switch (process.argv[2]) {
        case '-q': {
            await getLoaderAndQuote();
            process.exit();
        }
        default: {
        }
    }
    displayTitle('tiny');
    let menuChoice = await (prompts(prompt.menu, { onCancel }));
    const { MenuSelection } = menuChoice;
    switch (MenuSelection) {
        case "Quote": {
            await getLoaderAndQuote();
            break;
        }
        case "Setup": {
            let userInfo = checkOS();
            let setupChoice = await (prompts(prompt.setup, { onCancel }))
            const { SetupSelection } = setupChoice;

            //? Once test published switch paths from dev to prod....
            //? Add a conditional here to check the operating system and based on the system we'll change the npm path correctly, right now, defaulting to windows.
            // const npmPath = os.userInfo().homedir + "/AppData/Roaming/npm/node_modules/cli-quotes/"

            const npmPath = "C:/Coding/MyTools/NPM/QuoteDisplay/index.js -q";

            if (SetupSelection) {
                switch (userInfo.System.Shell) {
                    case "pwsh.exe": {
                        handlePowerShell("y", npmPath);
                        break;
                    }
                    default: {
                        console.log("Shell not supported", userInfo);
                    }
                }
            } else {
                switch (userInfo.System.Shell) {
                    case "pwsh.exe": {
                        handlePowerShell("n", npmPath);
                        break;
                    }
                    default: {
                        console.log(red("Shell not supported"), userInfo);
                    }
                };
            };
            break;
        }
        case "About": {
            console.log(green(`
CLI Quotes ${version} \n`) + '\n' +
                '* Randomized Quotes\n' + '\n' +
                '* Option available to run quote on each terminal session.\n' + '\n' +
                '* To run quote once pass the flag -q.\n' + '\n' +
                '* ZenQuotes API will pull 50 quotes, these will be stored locally and used, opposed to numerous network requests.\n'
            );
            break;
        }
        case "Options": {

            break;
        }
        default: {
            onCancel();
        }
    }
};

async function handlePowerShell(flag, npmPath) {
    const profileExt = ".ps1";
    const powershellProfileDir = `${os.userInfo().homedir}` + "/Documents/WindowsPowerShell";
    const powershellProfileFile = powershellProfileDir + "/Microsoft.PowerShell_profile";
    const appendLine = "\nnode " + npmPath;

    if (flag == "y") {
        if (checkWinPowershellProfile()) {
            fs.readFile(powershellProfileFile + profileExt, async function (err, data) {
                if (err) throw err;
                if (data.includes(appendLine)) {
                    let revertChoice = await (prompts(prompt.revert, { onCancel }));
                    const { RevertSelection } = revertChoice;
                    if (RevertSelection) {
                        revertBack(powershellProfileFile, profileExt);
                    };
                } else {
                    performBackupAndAppendNew(powershellProfileFile, profileExt, appendLine);
                };
            });
        } else {
            console.log(blue("\nHome Profile directory/file not found, creating Powershell Profile file ..(.ps1)"));
            fs.writeFileSync(powershellProfileFile + profileExt, "");
            performBackupAndAppendNew(powershellProfileFile, profileExt, appendLine);
        };
    } else {
        if (checkWinPowershellProfile()) {
            fs.readFile(powershellProfileFile + profileExt, async function (err, data) {
                if (err) throw err;
                if (data.includes(appendLine)) {
                    revertBack(powershellProfileFile, profileExt);
                } else {
                    console.log(red("Appended line not found in profile!"));
                };
            });
        } else {
            console.log(red("Profile not found, select yes to create a profile to enable auto run!"));
        };
    };
};
// ---------------------------------------------------
// SECTION PROMPTS
// ---------------------------------------------------
const prompt = {
    menu: [{
        type: 'select',
        name: 'MenuSelection',
        message: 'Choose an option',
        choices: [
            { title: '🗨️ Give Me A Quote', description: '', value: 'Quote' },
            { title: 'ℹ️ About', description: '', value: 'About' },
            { title: '🛠️ Setup', description: 'For running a quote on a new terminal instance', value: 'Setup' },
            // { title: '💻 Options', description: 'API options', value: 'Options' },
        ],
        initial: 0,
    }],
    setup: [{
        type: 'confirm',
        name: 'SetupSelection',
        message: 'Do you want to display a quote on each new terminal session?',
        initial: false,
    }],
    revert: [{
        type: 'confirm',
        name: 'RevertSelection',
        message: 'Autorun quotes is already enabled, would you like to turn it off?',
        initial: false,
    }]
};

async function getQuote() {
    let response;
    let apiOptions = {
        src: 'zenquotes',
        api1: {
            path: 'https://api.quotable.io/random'
        },
        api2: {
            path: 'https://zenquotes.io/api/random',
            batchPath: 'https://zenquotes.io/api/quotes/50'
        }
    }
    try {
        switch (apiOptions.src) {
            case 'quoteable': {
                response = await (await (fetch(apiOptions.api1.path))).json();
                return `${response.content} \n- ${response.author} \n`;
            }
            case 'zenquotes': {
                try {
                    if (fs.readFileSync(__dirname + '/ZenQuotes.json')) {
                        return await readQuoteFromBatch();
                    }
                } catch (err) {
                    if (err.code === 'ENOENT') {
                        await saveBatchQuotes(await getBatchQuotesFromZenQuotes());
                        return await getQuote();
                    }
                }
            }
        }
    } catch (err) {
        console.log(red(`Error: ${err}`))
        return;
    };
}
async function getBatchQuotesFromZenQuotes() {
    let response = await (await (fetch("https://zenquotes.io/api/quotes/50"))).json();
    return response;
}
async function saveBatchQuotes(res) {
    fs.writeFileSync(__dirname + '/ZenQuotes.json', JSON.stringify(res), "utf8")
}
async function readQuoteFromBatch() {
    let result = JSON.parse(fs.readFileSync(__dirname + '/ZenQuotes.json', "utf8"));
    if (checkBatchAmount(result)) {
        let randomIdx = Math.floor(Math.random() * result.length)
        let single = result[randomIdx];
        result.splice(randomIdx, 1);
        fs.writeFileSync(__dirname + '/ZenQuotes.json', JSON.stringify(result), "utf8");
        return single.q + '\n' + '-' + single.a + '\n'
    } else {
        await saveBatchQuotes(await getBatchQuotesFromZenQuotes());
        return await readQuoteFromBatch();
    }
}

function checkBatchAmount(res) {
    if (res.length > 0) {
        return true;
    }
    return false;
}

async function removeQuoteFromBatch(res, idx) {
    return res.splice(idx, 1);
}

async function getLoaderAndQuote() {
    console.log("");
    try {
        await oraPromise(getQuote(),
            {
                discardStdin: false,
                indent: 0,
                text: 'Loading quote',
                spinner: cliSpinners.aesthetic,
                successText: r => r,
                failText: "Error"
            }
        );
    } catch (err) {
        console.log(err);
        return;
    }
};

function executeCommand(command, shell) {
    exec(command, { shell: shell }, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`${stdout}`);
    });
};

function checkWinPowershellProfile() {
    try {
        const powershellProfileDir = `${os.userInfo().homedir}` + "/Documents/WindowsPowerShell"
        if (fs.readdirSync(powershellProfileDir)) {
            if (fs.readFileSync(powershellProfileDir + "/Microsoft.PowerShell_profile.ps1")) {
                return true;
            } else {
                return false;
            };
        };
    } catch (err) {
        return false;
    };
};

async function promise(runFunc, msg) {
    return msg;
};

async function revertBack(fileName, fileType) {
    await oraPromise(promise(fs.rename(
        fileName + ".bak",
        fileName + fileType,
        (err) => {
            if (err) throw err;
        }
    ), ""),
        {
            discardStdin: false,
            indent: 2,
            text: 'Reverting...',
            spinner: cliSpinners.aesthetic,
            successText: "Reverted from backup!",
            failText: "Error"
        }
    );
};

async function performBackupAndAppendNew(fileName, fileType, appendLine) {

    //? /* NOTE - 
    //? Rename old profile file with a new extension .bak
    console.log("");
    await oraPromise(promise(fs.rename(
        fileName + fileType,
        fileName + ".bak",
        (err) => {
            if (err) throw err;
        }
    ), ""),
        {
            discardStdin: false,
            indent: 2,
            text: 'Backing up...',
            spinner: cliSpinners.aesthetic,
            successText: "Backed up old profile!...(.bak) & created a new one (.ps1)",
            failText: "Error"
        }
    );

    //? /* NOTE - 
    //? Copy data from.bak file into a new profile file
    await oraPromise(promise(fs.copyFileSync(
        fileName + ".bak",
        fileName + fileType
    ), ``),
        {
            discardStdin: false,
            indent: 2,
            text: 'Copying...',
            spinner: cliSpinners.aesthetic,
            successText: `Copied data from .bak to new profile`,
            // successText: `Copied data from .bak to new profile ${fileName.replaceAll("/", `\\`) + fileType}`,
            failText: "Error"
        }
    );

    //? /* NOTE - 
    //? Append the line that will execute the node script
    await oraPromise(promise(fs.appendFileSync(fileName + fileType, appendLine, 'utf8'), ""),
        {
            discardStdin: false,
            indent: 2,
            text: 'Appending...',
            spinner: cliSpinners.aesthetic,
            successText: "Appended run command to profile",
            failText: "Error"
        }
    );

    //? /* NOTE - 
    //? Completion Spinner
    await oraPromise(promise("", ""),
        {
            discardStdin: false,
            indent: 2,
            text: 'Completing',
            spinner: cliSpinners.aesthetic,
            successText: "Completed, open a new terminal session to try it! :) \n",
            failText: "Error"
        }
    );
    console.log("");
};

function checkOS() {
    let userInfo = {
        System: {
            Name: os.userInfo().username,
            Platform: process.platform,
            OS: process.env.OS,
            Shell: ""
        }
    };
    if (userInfo.System.Platform.toLowerCase().includes("win")) {
        userInfo.System.Shell = "pwsh.exe" || "cmd.exe";
    };
    return userInfo;
};

function displayTitle(font) {
    CFonts.say('CLI Quotes', {
        font: font,              // define the font face
        align: 'left',              // define text alignment
        colors: ['red'],         // define all colors
        background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
        letterSpacing: 1,           // define letter spacing
        lineHeight: 1,              // define the line height
        space: true,                // define if the output text should have empty lines on top and on the bottom
        maxLength: '0',             // define how many character can be on one line
        gradient: ['red', 'blue', 'green'],            // define your two gradient colors
        independentGradient: false, // define if you want to recalculate the gradient for each new line
        transitionGradient: true,  // define if this is a transition between colors directly
        env: 'node'                 // define the environment CFonts is being executed in
    });
};

function onCancel() {
    console.clear();
    console.log(red('Exiting...'));
    process.exit();
};

main();