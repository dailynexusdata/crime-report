import os
import tabula
import pandas as pd

# os.remove("output.csv")

# tabula.convert_into(
#     "Adult IV Arrest Info.pdf",
#     "output.csv",
#     output_format="csv",
#     pages=1,
#     columns=[1, 255, 540, 595, 660, 815, 1130, 1225, 1340, 1430, 1515]
# )

output = tabula.read_pdf(
    "pdf parsing/Adult IV Arrest Info.pdf",
    pages="all",
    columns=[1, 255, 540, 595, 660, 815, 1130, 1225, 1340, 1430, 1515],
    pandas_options={'header': None}
)

combined = pd.DataFrame()

for page in output:
    combined = combined.append(page)


headers = combined.iloc[0]
combined = combined[1:]
combined.columns = headers
combined = combined.loc[:, combined.columns.notnull()]

print(combined.columns)


def split_col(val):
    if val is None:
        return "", ""
    split = str(val).split(" ", 1)
    return split if len(split) == 2 else [split[0], ""]


dob_emp_col = combined.columns[3]
combined["dob"] = [split_col(s)[0] for s in combined[dob_emp_col]]
combined["employer"] = [
    split_col(s)[1]
    for s in combined[dob_emp_col]
]

combined["date"] = [
    split_col(s)[0]
    for s in combined["Arrrest Date Arrest Time"]
]
combined["time"] = [
    split_col(s)[1]
    for s in combined["Arrrest Date Arrest Time"]
]


def split_name(val):
    if val is None:
        return "", ""
    val = str(val).split(",")

    if len(val) != 2:
        val = val[0].split(" ")

    return val[1].split(" ", 1)[0], val[0] if len(val) == 2 else "", ""


combined["last"] = [
    split_name(s)[1]
    for s in combined["Name"]
]
combined["first"] = [
    split_name(s)[0]
    for s in combined["Name"]
]

combined = combined.drop(
    [dob_emp_col, "Arrrest Date Arrest Time", "Name"], axis=1)

combined.to_csv("data/adults_with_names.csv")

verif = combined[combined["employer"] == "UCSB"][["first", "last", "dob"]]


def split_date(d):
    if d is None:
        return "", ""
    splt = d.split("/")
    return splt[0], splt[1]


verif["month"] = [
    split_date(d)[0]
    for d in verif["dob"]
]
verif["day"] = [
    split_date(d)[1]
    for d in verif["dob"]
]
verif = verif.rename(
    {"first": "firstName", "last": "lastName"}, axis=1).drop(["dob"], axis=1)

verif.to_json("get majors/verif.csv", orient="records")
