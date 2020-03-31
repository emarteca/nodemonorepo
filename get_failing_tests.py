import pandas as pd 
import xml.etree.ElementTree as ET
import sys

# before this, process with bash to get just the fails
def process_fails_file( filename):
	to_ret = pd.read_csv( filename, sep = ' ', header=None)
	to_ret = to_ret[to_ret[0] == "FAIL"]
	to_ret.drop([0, 2], inplace=True, axis=1) # delete the garbage initial columns
	to_ret.columns = ["suite"]
	return( to_ret)


def get_failing_tests( filename):
	root = ET.parse( filename).getroot()
	# we already know the shape of the tree so we can just hardcode this
	failing_tests = []
	for ts in root:
		for t in ts:
			for e in t:
				if e.tag == "failure":
					failing_tests += [t.attrib["classname"]]
	return( list(set(failing_tests)))

def print_DF_to_file( df, filename):
	f = open(filename, 'w');
	f.write(df.to_csv(index = False, header=False))
	f.close()

def main():
	new_root = "/home/ellen/Documents/ASJProj/TESTING_reordering/nodemonorepo/"
	failing_suites = process_fails_file( "fails.csv")
	print_DF_to_file( failing_suites.apply(lambda row: new_root + row.suite, axis=1), "test_list.txt")
	failing_tests = get_failing_tests("junit-unit-tests.xml")
	print_DF_to_file(pd.DataFrame(failing_tests).drop_duplicates(), "affected_test_descs.txt")

main()
