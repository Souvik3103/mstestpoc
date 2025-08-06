using System.Reflection;
using System.Text.RegularExpressions;
using Microsoft.VisualStudio.TestTools.UnitTesting;

var dllPath = args[0];
var prefixFilter = "tc:"; // Example prefix filter, can be set to any value or left empty

var assembly = Assembly.LoadFrom(dllPath);
var allTests = new List<object>();

foreach (var type in assembly.GetTypes())
{

    foreach (var method in type.GetMethods())
    {
        var isTestMethod = method.GetCustomAttribute(typeof(TestMethodAttribute)) != null;

        if (isTestMethod)
        {
            var categories = method.GetCustomAttributes<TestCategoryAttribute>()
                                   .SelectMany(c => c.TestCategories)
                                   .ToArray();
            //if (!string.IsNullOrEmpty("Sanity") && !categories.Contains("Sanity"))
            //    continue;

            if (!string.IsNullOrEmpty(prefixFilter) && !categories.Any(c => c.StartsWith(prefixFilter)))
                continue;


            allTests.Add(new
            {
                Name = $"{type.FullName}.{method.Name}",
                Categories = categories
            });
        }
    }
}

Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(allTests));
