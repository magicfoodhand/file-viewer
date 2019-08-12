var API = function () {
    var fileContents = {}

    var displayedFiles = []

    return {
        separator: ',',
        lineSeparator: "\n",
        changeSeparator: function(event) {
            API.separator = event.target.value
        },
        changeLineSeparator: function(event) {
            API.lineSeparator = event.target.value
        },
        deleteEverything: function () {
            var result = confirm("Are you sure you want to start over?");
            if(result === true) {
                fileContents = {}
                displayedFiles = []

                API.separator = ','
                API.lineSeparator = "\n"

                document.querySelector('#file-options').innerHTML = ''
                document.querySelector('#file-display').innerHTML = ''
                document.querySelector('#files').value = ''
                document.querySelector('#file-contents').value = ''

                document.querySelector("#column-separator").value = API.separator
                document.querySelector("#line-separator").value = API.lineSeparator
            }
        },

        readFile: function (file) {
            var fileLines = []
            var reader = new FileReader();

            if(file.type === 'text/csv')
                reader.addEventListener('load', function (e) {
                    var csv = e.target.result || '';
                    csv.split(API.lineSeparator).filter(function (v) { return v !== '' }).forEach(function (value) {
                        fileLines.push(value.split(API.separator))
                    })
                });
            else
                reader.addEventListener('load', function (e) {
                    var json = e.target.result || '[]';
                    if(json[0] !== '[') {
                        console.log('Json is not an array')
                        json = '[' + json + ']'
                    }
                    var parsedJson = JSON.parse(json)

                    var fields = Object.keys(parsedJson[0])
                    var replacer = function(key, value) { return value === null || value === undefined ? '' : value }

                    fileLines.push(fields) // add header column

                    parsedJson.map(function(row){
                        return fields.map(function(fieldName){
                            return JSON.stringify(row[fieldName], replacer)
                        })
                    }).forEach(function (value) {
                        fileLines.push(value)
                    })
                });

            reader.readAsBinaryString(file);

            return fileLines
        },

        displayFile: function(index) {
            var filename = displayedFiles[index]

            var contents = (fileContents[filename] || [])

            // [], [[]], [['']]
            if(contents.length === 0
                || (contents.length === 1
                    && (contents[0].length === 0
                        || (contents[0].length === 1 && contents[0][0] === '')))) {
                alert(filename+' is empty')
                return
            }

            var header = contents[0]

            new Tabulator("#file-contents", {
                height:500, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                data: contents.slice(1, contents.length).map(function (value, rowIndex) {
                    var result = !header.includes("id") ? { id: rowIndex } : {}
                    header.forEach(function (column, index) {
                        result[column] = value[index]
                    })
                    result.align = 'center'
                    console.log(result)
                    return result
                }), //assign data to table
                layout:"fitColumns", //fit columns to width of table (optional)
                columns: header.map(function (value) {
                    return {
                        title: value, field: value
                    }
                }),
                rowClick:function(e, row){ //trigger an alert message when the row is clicked
                    alert("Row " + row.getData().id + " Clicked!!!!");
                },
            });
        },

        fileOption: function(name, index) {
            return '<li><button onclick="API.displayFile('+index+')">'+name+'</button></li>'
        },

        addFileOption: function (filename) {
            if(displayedFiles.indexOf(filename) === -1)
                displayedFiles.push(filename)
            var optionContents = ''
            for (var i = 0, len = displayedFiles.length; i < len; i++) {
                optionContents += API.fileOption(displayedFiles[i], i)
            }
            document.querySelector('#file-options').innerHTML = optionContents
        },

        uploadFile: function (file) {
            fileContents[file.name] = API.readFile(file)

            API.addFileOption(file.name)
        },

        fileUploader: function (event) {
            for (var i = 0, files = event.target.files, len = files.length; i < len; i++) {
                API.uploadFile(files[i])
            }
        }
    }
}()

document.querySelector('#files').addEventListener('change', API.fileUploader)
document.querySelector("#column-separator").value = API.separator
document.querySelector("#line-separator").value = API.lineSeparator