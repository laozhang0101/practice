import csv
import json
import os
import subprocess
from pathlib import Path


CSV_PATH = Path(r"E:\laozhang0101_practice\practice\001.战斗\dragon_action_inventory.csv")
TITLE = "Dragon 动作资源识别表"
CHUNK_SIZE = 100
LARK_CLI = r"C:\Users\zhanggz\AppData\Roaming\npm\lark-cli.cmd"


def run_cli(args: list[str]) -> dict:
    env = os.environ.copy()
    env["LARK_CLI_NO_PROXY"] = "1"
    result = subprocess.run(
        [LARK_CLI, *args],
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=env,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stdout or result.stderr)
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(result.stdout or result.stderr) from exc


def main() -> None:
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.reader(file)
        rows = list(reader)

    headers = rows[0]
    data_rows = rows[1:]

    create = run_cli(
        [
            "sheets",
            "+create",
            "--as",
            "bot",
            "--title",
            TITLE,
            "--headers",
            json.dumps(headers, ensure_ascii=False),
        ]
    )

    spreadsheet_token = create["spreadsheet"]["token"]
    sheet_id = create["spreadsheet"]["sheets"][0]["sheet_id"]
    url = create["spreadsheet"]["url"]

    for index in range(0, len(data_rows), CHUNK_SIZE):
        chunk = data_rows[index : index + CHUNK_SIZE]
        run_cli(
            [
                "sheets",
                "+append",
                "--as",
                "bot",
                "--spreadsheet-token",
                spreadsheet_token,
                "--sheet-id",
                sheet_id,
                "--range",
                "A1",
                "--values",
                json.dumps(chunk, ensure_ascii=False),
            ]
        )

    print(json.dumps({"url": url, "spreadsheet_token": spreadsheet_token, "sheet_id": sheet_id, "rows": len(data_rows)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
