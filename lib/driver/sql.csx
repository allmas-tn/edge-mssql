//#r "System.dll"
//#r "System.Data.dll"
//#r "System.Web.Extensions.dll"

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

public class Startup 
{
    public async Task<object> Invoke(IDictionary<string, object> parameters)
    {
        string connectionString = parameters.ContainsKey("connectionString") ? (string)parameters["connectionString"] : "";
        string commandString = parameters.ContainsKey("command") ? (string)parameters["command"] : "";
        IDictionary<string, object> queryParameters = parameters.ContainsKey("parameters") ? (IDictionary<string, object>)parameters["parameters"] : null;
        bool nonQuery = parameters.ContainsKey("nonQuery") ? (bool)parameters["nonQuery"] : false;

        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            using (SqlCommand command = new SqlCommand(commandString, connection))
            {
                this.AddParameters(command, queryParameters);
                await connection.OpenAsync();

                if (nonQuery)
                {
                    return await command.ExecuteNonQueryAsync();
                }
                else
                {
                    return await this.ExecuteQuery(command);
                }
            }
        }
    }

    void AddParameters(SqlCommand command, IDictionary<string, object> parameters)
    {
        if (parameters != null)
        {
            foreach (KeyValuePair<string, object> parameter in parameters)
            {
                command.Parameters.AddWithValue(parameter.Key, parameter.Value ?? DBNull.Value);
            }
        }
    }

    async Task<object> ExecuteQuery(SqlCommand command)
    {
        List<object> rows = new List<object>();

        using (DbDataReader reader = await command.ExecuteReaderAsync(CommandBehavior.CloseConnection))
        {
            IDataRecord record = (IDataRecord)reader;
            while (await reader.ReadAsync())
            {
                var dataObject = new ExpandoObject() as IDictionary<string, Object>;
                var resultRecord = new object[record.FieldCount];
                record.GetValues(resultRecord);
                for (int i = 0; i < record.FieldCount; i++)
                {
                    Type type = record.GetFieldType(i);
                    if (resultRecord[i] is System.DBNull)
                    {
                        resultRecord[i] = null;
                    }
                    else if (type == typeof(byte[]) || type == typeof(char[]))
                    {
                        resultRecord[i] = Convert.ToBase64String((byte[])resultRecord[i]);
                    }
                    else if (type == typeof(Guid))
                    {
                        resultRecord[i] = resultRecord[i].ToString();
                    }
                    else if (type == typeof(IDataReader))
                    {
                        resultRecord[i] = "<IDataReader>";
                    }

                    dataObject.Add(record.GetName(i), resultRecord[i]);
                }
                rows.Add(dataObject);
            }

            return rows;
        }
    }
}
