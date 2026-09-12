//! Prints every board `xpui-boards` describes, as JSON, so the website can draw
//! each device's body from the same numbers the simulator draws it from.

use xpui_boards_core::{Bezel, Board, PhysicalButton};

fn main() {
    let boards: Vec<String> = xpui_boards_xteink::ALL
        .into_iter()
        .chain(xpui_boards_seeed::ALL)
        .chain(xpui_boards_pimoroni::ALL)
        .map(|board| board_json(&board))
        .collect();
    println!("[{}]", boards.join(","));
}

fn board_json(board: &Board) -> String {
    let bezel = board.bezel.as_ref().map_or_else(|| "null".to_string(), bezel_json);
    format!(
        r#"{{"slug":{},"name":{},"width":{},"height":{},"bezel":{}}}"#,
        text(board.slug),
        text(board.name),
        board.width,
        board.height,
        bezel
    )
}

fn bezel_json(bezel: &Bezel) -> String {
    let buttons: Vec<String> = bezel.buttons.iter().map(button_json).collect();
    format!(
        r#"{{"body":{},"panelOrigin":{},"panelSize":{},"buttons":[{}]}}"#,
        pair(bezel.body),
        pair(bezel.panel_origin),
        pair(bezel.panel_size),
        buttons.join(",")
    )
}

fn button_json(button: &PhysicalButton) -> String {
    format!(
        r#"{{"label":{},"centre":{},"size":{}}}"#,
        text(button.label),
        pair(button.centre),
        pair(button.size)
    )
}

fn pair((a, b): (i32, i32)) -> String {
    format!("[{a},{b}]")
}

/// A JSON string. Labels are short printable text, so escaping quotes and
/// backslashes is all JSON asks of them.
fn text(value: &str) -> String {
    format!("\"{}\"", value.replace('\\', "\\\\").replace('"', "\\\""))
}
