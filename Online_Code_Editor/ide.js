// API_KEY = "606c92ef29msh1d73d864ed467a9p1523bdjsne505b2e4aa76"; // Get yours for free at https://judge0.com/ce or https://judge0.com/extra-ce
API_KEY = "62118fce2dmsh26cd9d4c9eeb4e9p17f552jsn70b67ed04275"; // Get yours for free at https://judge0.com/ce or https://judge0.com/extra-ce
var language_to_id = {
  Bash: 46,
  C: 50,
  "C#": 51,
  "C++": 54,
  Java: 62,
  Python: 71,
  Ruby: 72,
  Go: 60,
  Rust: 73,
  Swift: 83,
  PHP: 68,
  Kotlin:78,
  "R (4.0.0)":80,
  "Visual Basic.Net (vbnc 0.0.0.5943)":84,
  "Perl (5.28.1)":85
};

function encode(str) {
  return btoa(unescape(encodeURIComponent(str || "")));
}

function decode(bytes) {
  var escaped = escape(atob(bytes || ""));
  try {
    return decodeURIComponent(escaped);
  } catch {
    return unescape(escaped);
  }
}

function errorHandler(jqXHR, textStatus, errorThrown) {
  $("#output").val(`${JSON.stringify(jqXHR, null, 4)}`);
  $("#run").prop("disabled", false);
}

function check(token) {
  $("#output").val($("#output").val() + "\n⏬ Checking submission status...");
  $.ajax({
    url: `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
    type: "GET",
    headers: {
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "x-rapidapi-key": API_KEY,
    },
    success: function (data, textStatus, jqXHR) {
      if ([1, 2].includes(data["status"]["id"])) {
        $("#output").val(
          $("#output").val() + "\n Status: " + data["status"]["description"]
        );
        setTimeout(function () {
          check(token);
        }, 1000);
      } else {
        var output = [decode(data["compile_output"]), decode(data["stdout"])]
          .join("\n")
          .trim();
        $("#output").val(
          `${data["status"]["id"] != "3" ? "🔴" : "✅"} ${
            data["status"]["description"]
          }\n${output}`
        );
        $("#run").prop("disabled", false);
      }
    },
    error: errorHandler,
  });
}

function run() {
  $("#run").prop("disabled", true);
  $("#output").val("⚙️ Creating submission...");

  let encodedExpectedOutput = encode($("#expected-output").val());
  if (encodedExpectedOutput === "") {
    encodedExpectedOutput = null; // Assume that user does not want to use expected output if it is empty.
  }

  $.ajax({
    url: "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false",
    type: "POST",
    contentType: "application/json",
    headers: {
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "x-rapidapi-key": API_KEY,
    },
    data: JSON.stringify({
      language_id: language_to_id[$("#lang").val()],
      source_code: encode($("#source").val()),
      stdin: encode($("#input").val()),
      expected_output: encodedExpectedOutput,
      redirect_stderr_to_stdout: true,
    }),
    success: function (data, textStatus, jqXHR) {
      $("#output").val($("#output").val() + "\n🎉 Submission created.");
      setTimeout(function () {
        check(data["token"]);
      }, 2000);
    },
    error: errorHandler,
  });
}

$("body").keydown(function (e) {
  if (e.ctrlKey && e.keyCode == 13) {
    run();
  }
});

$("textarea").keydown(function (e) {
  if (e.keyCode == 9) {
    e.preventDefault();
    var start = this.selectionStart;
    var end = this.selectionEnd;

    var append = "    ";
    $(this).val(
      $(this).val().substring(0, start) + append + $(this).val().substring(end)
    );

    this.selectionStart = this.selectionEnd = start + append.length;
  }
});

$("#source").focus();
