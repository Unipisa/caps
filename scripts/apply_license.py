#!/usr/bin/env python3
#
# This scripts rewrite the license of a file with the given template.
#
# This is best used with a proper find, such as:
#
#  find app/src \( -name \*.php -or -name \*.ctp \) \
#    -exec ./scripts/apply_licence.py {} \;
#

import datetime, sys

license_text = r"""/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - %d E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */"""

def find_copyright_statement(content):
    # We find a comment with double *, that has
    # the text Copyright (C) in it.
    cursor = 0
    while cursor < len(content):
        cursor = content.find('/**', cursor)
        block_end = content.find('*/', cursor)

        if cursor == -1 or block_end == -1:
            return (-1, -1)
        else:
            if "COPYRIGHT (C)" in content[cursor:block_end+1].upper():
                return (cursor, block_end+1)
            else:
                cursor = block_end + 1

    return (-1, -1)

def apply_license(filename):
    with open(filename) as h:
        content = h.read()

    now = datetime.datetime.now()
    license = license_text % now.year

    (s,e) = find_copyright_statement(content)

    if len(content.strip()) == 0:
        return

    if s == -1:
        if not content.strip().startswith("<?php"):
            content = "<?php\n" + license + "\n?>\n" + content
        else:
            content = "<?php\n" + license + content.strip()[5:]
    else:
        content = content[0 : s] + license + content[e+1:]

    with open(filename, 'w') as h:
       h.write(content)

if __name__ == "__main__":

   apply_license(sys.argv[1])
